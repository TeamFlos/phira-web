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
  // `expireAt` is RFC3339. If it ever fails to parse, fall back to the refresh
  // window: an unparseable `expires` is ignored by the browser, which would
  // silently turn the cookie into a session cookie.
  const expireAt = Date.parse(r.expireAt);
  setCookie('access_token', r.token, Number.isFinite(expireAt) ? new Date(expireAt).toUTCString() : refreshCookieExpiry());
  setCookie('refresh_token', r.refreshToken, refreshCookieExpiry());
}

// --- refresh de-dup -------------------------------------------------------
// A single in-flight refresh promise shared across concurrent 401s so we don't
// burn the (still-valid) refresh token N times at once.
type RefreshResult = 'ok' | 'rejected' | 'error';
let refreshing: Promise<RefreshResult> | null = null;

/**
 * Serialize refreshes across tabs (Web Locks, when available). Refresh tokens
 * rotate on every exchange, so two tabs refreshing the same token at once
 * would make one of them see a rejected token and tear down the session both
 * tabs share through their common cookies.
 */
function withRefreshLock<T>(fn: () => Promise<T>): Promise<T> {
  return navigator.locks ? navigator.locks.request('phira-web-refresh', fn) : fn();
}

/** Exchange the refresh token for a fresh pair. */
async function doRefresh(refreshToken: string): Promise<RefreshResult> {
  let resp: Response;
  try {
    resp = await fetch(`${API_HOST}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    return 'error';
  }
  if (resp.ok) {
    const data = (await resp.json()) as { token: string; refreshToken: string; expireAt: string };
    storeTokens(data);
    return 'ok';
  }
  // A 4xx means the refresh token itself was rejected (expired/revoked), so
  // the session is gone. Transient failures (5xx, network) must keep it.
  return resp.status >= 400 && resp.status < 500 ? 'rejected' : 'error';
}

function ensureRefreshed(refreshToken: string): Promise<RefreshResult> {
  if (!refreshing) {
    refreshing = withRefreshLock(async () => {
      // Another tab may have refreshed while we queued for the lock; the new
      // tokens are already in the shared cookie jar, so use them as-is.
      const current = getCookie('refresh_token');
      if (!current) return 'rejected';
      if (current !== refreshToken) return 'ok';
      return doRefresh(refreshToken);
    })
      .catch((): RefreshResult => 'error')
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

/**
 * Make sure an access token is available, refreshing it when only the 30d
 * refresh token is left (cold start, or the 6h access cookie expired while
 * the tab stayed open). Returns whether a session exists; an outright
 * rejection clears the stored session.
 */
export async function ensureSession(): Promise<boolean> {
  if (getCookie('access_token')) return true;
  const refreshToken = getCookie('refresh_token');
  if (!refreshToken) return false;
  const result = await ensureRefreshed(refreshToken);
  if (result === 'rejected') {
    logout();
    return false;
  }
  return result === 'ok';
}

/** On a cold start the 401 refresh above never fires, so restore the session manually. */
export async function bootstrapAuth(): Promise<void> {
  await ensureSession();
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
      const result = refreshToken ? await ensureRefreshed(refreshToken) : 'rejected';
      if (result === 'rejected') {
        logout();
        pleaseLogin(router);
        return;
      }
      // Transient refresh failure: keep the session and surface the 401
      // instead of logging the user out over a hiccup.
      if (result === 'error' || !source) return;
      const token = getCookie('access_token');
      if (!token) return;
      const headers = new Headers(source.headers);
      headers.set('Authorization', `Bearer ${token}`);
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
 *
 * Non-2xx responses with an empty or undecodable body make openapi-fetch
 * return a falsy `error` — fall back to the status line so those still toast.
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
      } else if (doToast && !res.response.ok) {
        toastError(new ApiError(`${res.response.status} ${res.response.statusText}`.trim()));
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
  // A bare string means the body wasn't the API's `{ code, error }` JSON —
  // e.g. a plain-text proxy error — so the text itself is the message.
  if (typeof error === 'string' && error) return new ApiError(error);
  const body = (error ?? {}) as { error?: unknown; code?: unknown };
  const message = typeof body.error === 'string' && body.error ? body.error : 'unknown error';
  const code = typeof body.code === 'string' ? body.code : undefined;
  return new ApiError(message, code);
}

export type ApiClient = Client<paths>;
