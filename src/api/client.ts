import createClient from 'openapi-fetch';
import type { paths } from './schema';
import { useRouter } from 'vue-router';
import { API_BASE, getCookie, setCookie, logout, pleaseLogin } from '../common';

/** API host shared with the existing local-development configuration. */
const API_HOST = API_BASE;

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
 * Typed API client. Call from a component `setup()` so the 401 handler can
 * redirect through its router.
 */
export function useApi() {
  const router = useRouter();
  const client = createClient<paths>({ baseUrl: API_HOST });
  const replaySources = new Map();

  client.use({
    // Keep an unread clone before fetch disturbs POST/PUT bodies. A later 401
    // can therefore replay the original request exactly once after refresh.
    onRequest: ({ request, id }) => {
      const headers = new Headers(request.headers);
      const token = getCookie('access_token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      const next = new Request(request, { headers });
      replaySources.set(id, next.clone());
      return next;
    },
    onResponse: async ({ response, schemaPath, id, options }) => {
      const source = replaySources.get(id);
      replaySources.delete(id);
      if (response.status !== 401 || schemaPath === '/login') return;
      const refreshToken = getCookie('refresh_token');
      if (!refreshToken || !(await ensureRefreshed(refreshToken))) {
        logout();
        pleaseLogin(router);
        return;
      }
      if (!source) return;
      const headers = new Headers(source.headers);
      headers.set('Authorization', `Bearer ${getCookie('access_token')}`);
      return options.fetch(new Request(source, { headers }));
    },
    onError: ({ id }) => {
      replaySources.delete(id);
    },
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
