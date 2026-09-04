import createClient, { type Client } from 'openapi-fetch';
import type { paths } from './schema';
import { useRouter } from 'vue-router';
import { API_BASE, getCookie, setCookie, logout, pleaseLogin, toastError } from '../common';

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
 *
 * Each request method (GET/POST/…) also honors a non-standard `toastError:
 * true` flag in its options: when set and the response carries an error body,
 * the message is auto-toasted. The flag is stripped before the request is
 * forwarded, so it never reaches the network.
 */
export function useApi(): Client<paths> {
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

  return withToastError(client);
}

const METHODS = ['GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE'] as const;

/**
 * Wrap an openapi-fetch client's request methods so the per-call `toastError`
 * init flag is honored. The typed signature is left untouched (openapi-fetch's
 * `InitParam` already admits arbitrary `[key: string]` options), so full
 * per-path type safety is preserved.
 */
function withToastError(client: Client<paths>): Client<paths> {
  for (const method of METHODS) {
    const original = (client as any)[method].bind(client);
    (client as any)[method] = async (url: any, ...init: any[]) => {
      const last = init[init.length - 1];
      let doToast = false;
      if (last && typeof last === 'object' && 'toastError' in last) {
        doToast = !!last.toastError;
        const rest = { ...last };
        delete rest.toastError;
        init[init.length - 1] = rest;
      }
      const res = await original(url, ...init);
      if (doToast && res.error) {
        toastError(apiError(res.error));
      }
      return res;
    };
  }
  return client;
}

/**
 * Error returned by the API for non-2xx. Carries the machine-readable `code`
 * (when present) so callers can branch on it, in addition to the human-readable
 * `message`. Thrown or read via {@link apiError}.
 */
export class ApiError extends Error {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

/**
 * Collapse an openapi-fetch error body into an {@link ApiError}. Always returns
 * a value (never null), so it's safe to throw or read `.message`/`.code` off it
 * directly — e.g. `throw apiError(error)` or `apiError(error).code`.
 */
export function apiError(error: unknown): ApiError {
  const body = (error ?? {}) as { error?: unknown; code?: unknown };
  const message = typeof body.error === 'string' && body.error ? body.error : 'unknown error';
  const code = typeof body.code === 'string' ? body.code : undefined;
  return new ApiError(message, code);
}

export type ApiClient = Client<paths>;
