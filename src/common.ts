import { useRouter } from 'vue-router';

import { toast } from './components/ToastsView.vue';

import { SUPPORTED_LOCALES, i18n } from './main';

import moment from 'moment';

import 'moment/dist/locale/zh-cn';
import 'moment/dist/locale/zh-hk';

export { toast };

export const LANGUAGES = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  'en-US': 'English',
};

export function loggedIn() {
  return !!getCookie('access_token');
}

export function setTitle(title: string) {
  document.title = title.length ? title + ' - Phira' : 'Phira';
}

export function changeLocale(locale: string) {
  if (locale.startsWith('en')) locale = 'en';
  if (!SUPPORTED_LOCALES.includes(locale)) locale = 'en';
  i18n.global.locale.value = (
    locale === 'zh-TW' ? 'zh-CN' : locale
  ) as typeof i18n.global.locale.value;
  localStorage.setItem('locale', locale);
  const momentLocale =
    {
      'zh-CN': 'zh-cn',
      'zh-TW': 'zh-hk',
      en: 'en-us',
    }[locale] ?? 'en-us';
  moment.locale(momentLocale);
}

export function isString(s: unknown): s is string {
  return typeof s === 'string';
}

export function detailedTime(time: string): string {
  const m = moment(time);
  return m.fromNow() + ' (' + m.format('lll') + ')';
}

export function userNameClass(
  badges: string[],
): 'text-[#673ab7]' | 'text-[#ff7043]' | 'text-base-content' {
  if (badges.includes('admin')) return 'text-[#673ab7]';
  if (badges.includes('sponsor')) return 'text-[#ff7043]';
  return 'text-base-content';
}

export function pageCount(count: number, pageNum: number) {
  return count ? Math.floor((count - 1) / pageNum) + 1 : 0;
}

export function toastError(error: any) {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.length) toast(msg, 'error');
}

export function fileToURL(file: string) {
  return file.replace(
    /https:\/\/api.phira.cn\/files\//g,
    'https://files-cf.phira.cn/',
  );
}

export type FetchApi = (
  path: string,
  request?: RequestInitWithJson,
  onSuccess?: (json: object, resp: Response) => void,
  onError?: (json: object, resp?: Response) => boolean,
) => object | null;

export function validateEmail(t: any, email: string) {
  if (
    !/^[a-z0-9!#$%&'*+/=?^_‘{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_‘{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(
      email,
    )
  ) {
    throw new Error(t('invalid-email'));
  }
}

export function validatePassword(t: any, password: string, repeat?: string) {
  if (!password || password.length < 8) {
    throw new Error(t('password-short'));
  }
  if (repeat && repeat !== password) {
    throw new Error(t('password-inconsistent'));
  }
}

export async function uploadFile(
  fetchApi: FetchApi,
  file: File,
): Promise<string> {
  const resp = (await fetchApi('/upload/avatar', {
    method: 'POST',
    body: file,
  })) as { id: string };
  return resp.id;
}

const cookieListener: (() => void)[] = [];

function triggerCookie() {
  for (const listener of cookieListener) listener();
}

export function setCookie(key: string, value: string, expires: string) {
  document.cookie = `${key}=${value}; expires=${expires}; SameSite=None; Secure`;
  triggerCookie();
}

export function deleteCookie(key: string) {
  setCookie(key, 'test', 'Thu, 01 Jan 1970 00:00:01 GMT');
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
  json?: object;
}

export function useFetchApi(): FetchApi {
  const router = useRouter();
  return async function (
    path: string,
    request?: RequestInitWithJson,
    onSuccess?: (json: object, resp: Response) => void,
    onError?: (json: object, resp?: Response) => boolean,
  ): Promise<object | undefined> {
    request = request || {};
    const headers = new Headers(request.headers);
    if (request && 'json' in request) {
      request.body = JSON.stringify(request.json);
      headers.set('Content-Type', 'application/json');
    }
    const access_token = getCookie('access_token');
    if (access_token) {
      headers.set('Authorization', 'Bearer ' + access_token);
    }
    request.headers = headers;
    try {
      const resp = await fetch('https://api.phira.cn' + path, request);
      const text = await resp.text();
      let json: any = { text };
      try {
        json = JSON.parse(text);
      } catch (e) {
        // empty
      }
      if (!resp.ok) {
        if (resp.status == 401) {
          // unauthorized
          logout();
          router.push('/login');
          toast(i18n.global.t('please-login'), 'error');
          throw new Error();
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
        toastError(e);
      }
    }
  };
}
