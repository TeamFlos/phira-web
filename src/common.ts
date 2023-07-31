
import { toast } from './components/Toasts.vue'

import { useRouter } from 'vue-router'

export { toast };

export function fileToURL(file: string) {
  return file.replace(/https:\/\/api.phira.cn\/files\//g, 'https://files-cf.phira.cn/');
}

export type FetchApi = (
  path: string,
  request?: RequestInitWithJson,
  onSuccess?: (json: object, resp: Response) => void,
  onError?: (json: object, resp?: Response) => boolean,
) => object | null;

export function validatePassword(password: string, repeat?: string) {
  if (!password || password.length < 8) {
    throw new Error('密码过短');
  }
  if (repeat && repeat !== password) {
    throw new Error('两次输入的密码不一致');
  }
}

export async function uploadFile(fetchApi: FetchApi, file: File): Promise<string> {
  let resp =
    await fetchApi('/upload/avatar', {
      method: 'POST',
      body: file,
    }) as { id: string };
  return resp.id;
}

let cookieListener: (() => void)[] = [];

function triggerCookie() {
  for (let listener of cookieListener) listener();
}

export function setCookie(key: string, value: string, expires: string) {
  document.cookie = `${key}=${value}; expires=${expires}; SameSite=None; Secure`;
  triggerCookie();
}

export function deleteCookie(key: string) {
  setCookie(key, '', new Date().toUTCString());
  triggerCookie();
}

export function logout() {
  deleteCookie('access_token');
}

// From https://stackoverflow.com/questions/10730362/get-cookie-by-name
export function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(';').shift();
}

export function addCookieListener(listener: () => void) {
  cookieListener.push(listener);
  listener();
}

interface RequestInitWithJson extends RequestInit {
  json?: object,
}

export function useFetchApi(): FetchApi {
  const router = useRouter();
  return async function (
    path: string,
    request?: RequestInitWithJson,
    onSuccess?: (json: object, resp: Response) => void,
    onError?: (json: object, resp?: Response) => boolean,
  ): object | null {
    request = request || {};
    let headers = new Headers(request.headers);
    if (request && 'json' in request) {
      request.body = JSON.stringify(request.json);
      headers.set('Content-Type', 'application/json');
    }
    let access_token = getCookie('access_token');
    if (access_token) {
      headers.set('Authorization', 'Bearer ' + access_token);
    }
    request.headers = headers;
    try {
      let resp = await fetch(__API_HOST__ + path, request);
      let text = await resp.text();
      let json: any = { text };
      try {
        json = JSON.parse(text);
      } catch (e) {}
      if (!resp.ok) {
        if (resp.status == 401) {
          // unauthorized
          logout();
          router.push('/login');
          toast('请登录', 'alert-error');
        } else if (!onError || onError(json, resp)) {
          if (!onSuccess) throw new Error(json.error);
          toast(json.error, 'error');
        }
      } else if (onSuccess) {
        onSuccess(json, resp);
      } else {
        return json;
      }
    } catch (e) {
      if (!onError || onError({})) {
        if (!onSuccess) throw e;
        toast(e, 'error');
      }
    }
  };
}
