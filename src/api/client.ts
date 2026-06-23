import createClient from 'openapi-fetch';
import type { paths } from './schema';
import { useRouter } from 'vue-router';
import { getCookie, setCookie, logout, pleaseLogin } from '../common';

/**
 * API host. Defaults to the same host the hand-rolled `useFetchApi` in
 * `common.ts` hardcodes; override per-environment with `VITE_API_HOST`.
 */
const API_HOST = import.meta.env.VITE_API_HOST ?? 'https://phira.5wyxi.com';

/** 30d cookie expiry for the refresh token (access token uses `expireAt`). */
function refreshCookieExpiry(): string {
  return new Date(Date.now() + 30 * 86400 * 1000).toUTCString();
}

/**
 * Persist both tokens after a successful login (or refresh). The access token
 * is opaque and Redis-backed (6h); the refresh token is good for 30d. Both are
 * JS-readable cookies (SameSite=None; Secure via `setCookie`) — the API never
 * sets them, we just use the cookie as client-side storage.
 */
export function storeTokens(r: { token: string; refreshToken: string; expireAt: string }) {
  setCookie('access_token', r.token, new Date(Date.parse(r.expireAt)).toUTCString());
  setCookie('refresh_token', r.refreshToken, refreshCookieExpiry());
}

// --- refresh de-dup -------------------------------------------------------
// A single in-flight refresh promise shared across concurrent 401s so we don't
// burn the (still-valid) refresh token N times at once.
let refreshing: Promise<boolean> | null = null;

async function doRefresh(refreshToken: string): Promise<boolean> {
  try {
    const resp = await fetch(`${API_HOST}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!resp.ok) return false;
    const data = (await resp.json()) as { token: string; refreshToken: string; expireAt: string };
    storeTokens(data);
    return true;
  } catch {
    return false;
  }
}

function ensureRefreshed(refreshToken: string): Promise<boolean> {
  if (!refreshing) {
    refreshing = doRefresh(refreshToken).finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

/**
 * Typed API client. Call from a component `setup()` (like `useFetchApi`) so the
 * 401 handler has access to the router for the login redirect.
 *
 *   const api = useApi();
 *   const { data, error } = await api.GET('/user/{id}', { params: { path: { id } } });
 */
export function useApi() {
  const router = useRouter();
  const client = createClient<paths>({ baseUrl: API_HOST });

  client.use({
    // Inject the bearer from the access_token cookie on every request.
    onRequest: ({ request }) => {
      const token = getCookie('access_token');
      if (token) {
        const headers = new Headers(request.headers);
        headers.set('Authorization', `Bearer ${token}`);
        return new Request(request, { headers });
      }
    },
    // On 401: try a single de-duplicated refresh + replay; else log out.
    onResponse: async ({ request, response, schemaPath, options }) => {
      if (response.status !== 401) return;
      // Never try to refresh the login/refresh call itself.
      if (schemaPath === '/login') return;
      const refreshToken = getCookie('refresh_token');
      if (!refreshToken || !(await ensureRefreshed(refreshToken))) {
        logout();
        pleaseLogin(router);
        return;
      }
      // Re-issue the original request with the freshly-stored access token.
      const headers = new Headers(request.headers);
      headers.set('Authorization', `Bearer ${getCookie('access_token')}`);
      return options.fetch(new Request(request, { headers }));
    },
    // No global onError toast: HTTP errors resolve as `{ error }` and are
    // handled per call site (mirroring the old `useFetchApi` contract, which
    // only toasted in callback mode); genuine network failures reject and are
    // caught by the caller's try/catch or `.catch()`.
  });

  return client;
}

/**
 * Extract the human-readable message from an openapi-fetch error body. The API
 * returns `{ error: "msg" }` for non-2xx; openapi-fetch parses that into
 * `error` regardless of whether the response was schema-documented.
 */
export function errMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'error' in error) {
    const v = (error as { error?: unknown }).error;
    if (typeof v === 'string') return v;
  }
  return '';
}

export type ApiClient = ReturnType<typeof useApi>;
