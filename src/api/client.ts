import createClient, { type Client } from 'openapi-fetch';
import type { paths } from './schema';
import { useRouter } from 'vue-router';
import { API_BASE, batchCookieChanges, clearLogoutFlag, getAuthEpoch, getToken, isLoggedOut, logout, pleaseLogin, rotateAuthEpoch, setCookie, toastError } from '../common';

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
export function storeTokens(r: { token: string; refreshToken: string; expireAt: string }, expectedEpoch?: string, expectedRefreshToken?: string): boolean {
  // A response must not be allowed to undo a logout or overwrite a newer
  // login which happened while its request was in flight.
  if (expectedEpoch !== undefined && getAuthEpoch() !== expectedEpoch) return false;
  if (expectedRefreshToken !== undefined && getToken('refresh_token') !== expectedRefreshToken) return false;

  // `expireAt` is RFC3339. If it ever fails to parse, use the documented access
  // token lifetime rather than the refresh lifetime; an unparseable `expires`
  // would otherwise silently turn the cookie into a session cookie.
  const expireAt = Date.parse(r.expireAt);
  const accessCookieExpiry = Number.isFinite(expireAt) ? new Date(expireAt).toUTCString() : new Date(Date.now() + 6 * 60 * 60 * 1000).toUTCString();
  batchCookieChanges(() => {
    // A new login starts a new session epoch. Refresh keeps the epoch stable
    // so an unrelated in-flight login is not discarded just because the
    // existing session renewed in another request/tab.
    if (expectedRefreshToken === undefined) rotateAuthEpoch();
    setCookie('access_token', r.token, accessCookieExpiry);
    setCookie('refresh_token', r.refreshToken, refreshCookieExpiry());
    // Lift the logout flag only after the fresh tokens are in place, so cookie
    // listeners never briefly observe an old token that a logout invalidated.
    clearLogoutFlag();
  });
  return true;
}

// --- refresh de-dup -------------------------------------------------------
// A single in-flight refresh promise shared across concurrent 401s so we don't
// burn the (still-valid) refresh token N times at once.
type RefreshResult = 'ok' | 'rejected' | 'error';
type RefreshFlight = {
  refreshToken: string;
  epoch: string;
  promise: Promise<RefreshResult>;
};
let refreshing: RefreshFlight | null = null;

type LockManagerLike = {
  request<T>(name: string, callback: () => Promise<T>): Promise<T>;
};

/**
 * Serialize refreshes across tabs (Web Locks, when available). Refresh tokens
 * rotate on every exchange, so two tabs refreshing the same token at once
 * would make one of them see a rejected token and tear down the session both
 * tabs share through their common cookies.
 */
function withRefreshLock<T>(fn: () => Promise<T>): Promise<T> {
  const locks = typeof navigator !== 'undefined' ? (navigator as Navigator & { locks?: LockManagerLike }).locks : undefined;
  return locks ? locks.request('phira-web-refresh', fn) : fn();
}

function resultAfterAuthChange(): RefreshResult {
  return isLoggedOut() || !getToken('refresh_token') ? 'rejected' : 'ok';
}

/** Exchange the refresh token for a fresh pair. */
async function doRefresh(refreshToken: string, epoch: string): Promise<RefreshResult> {
  let resp: Response;
  try {
    resp = await fetch(`${API_HOST}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    return getAuthEpoch() === epoch ? 'error' : resultAfterAuthChange();
  }

  // A logout or a newer login has precedence over every response from the old
  // session, including a response saying that the old refresh token expired.
  if (getAuthEpoch() !== epoch) return resultAfterAuthChange();
  // Another tab may have completed a refresh while this request was in flight.
  // Its rotated token is now authoritative; ignore both stale successes and
  // stale rejection responses.
  if (getToken('refresh_token') !== refreshToken) return resultAfterAuthChange();

  if (resp.ok) {
    try {
      const data = (await resp.json()) as { token: string; refreshToken: string; expireAt: string };
      return storeTokens(data, epoch, refreshToken) ? 'ok' : resultAfterAuthChange();
    } catch {
      return 'error';
    }
  }
  // Only the API's "login failed" answers mean the refresh token is dead:
  // 400 is the documented failure, 401 is what a bad refresh token returns,
  // 403 covers account-level denials. Anything else — notably 429 Too Many
  // Requests — is transient and must keep the session.
  return resp.status === 400 || resp.status === 401 || resp.status === 403 ? 'rejected' : 'error';
}

function ensureRefreshed(refreshToken: string, epoch: string): Promise<RefreshResult> {
  if (refreshing?.refreshToken === refreshToken && refreshing.epoch === epoch) return refreshing.promise;

  const promise = withRefreshLock(async () => {
    // Another tab may have refreshed while we queued for the lock; the new
    // tokens are already in the shared cookie jar, so use them as-is.
    const current = getToken('refresh_token');
    if (!current) return 'rejected';
    if (getAuthEpoch() !== epoch || current !== refreshToken) return resultAfterAuthChange();
    return doRefresh(refreshToken, epoch);
  }).catch((): RefreshResult => 'error');
  const flight: RefreshFlight = { refreshToken, epoch, promise };
  refreshing = flight;
  void promise.then(
    () => {
      if (refreshing === flight) refreshing = null;
    },
    () => {
      if (refreshing === flight) refreshing = null;
    },
  );
  return promise;
}

/**
 * Make sure an access token is available, refreshing it when only the 30d
 * refresh token is left (cold start, or the 6h access cookie expired while
 * the tab stayed open). Returns whether a session exists; an outright
 * rejection clears the stored session.
 */
export async function ensureSession(): Promise<boolean> {
  if (getToken('access_token')) return true;
  const refreshToken = getToken('refresh_token');
  if (!refreshToken) return false;
  const epoch = getAuthEpoch();
  const result = await ensureRefreshed(refreshToken, epoch);
  if (result === 'rejected') {
    if (logout(epoch)) return false;
    return !!getToken('access_token');
  }
  return result !== 'error' && !!getToken('access_token');
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
  type ReplaySource = {
    request: Request;
    accessToken?: string;
    epoch: string;
  };
  const replaySources = new Map<string, ReplaySource>();

  function replay(source: ReplaySource, token: string, fetch: typeof globalThis.fetch) {
    const headers = new Headers(source.request.headers);
    headers.set('Authorization', `Bearer ${token}`);
    return fetch(new Request(source.request, { headers }));
  }

  function endSession(source?: ReplaySource): boolean {
    if (logout(source?.epoch)) return true;
    // bootstrapAuth may have discovered the invalid refresh token before this
    // request's 401 handler. It already cleared the cookies, so still route a
    // protected request to login even though this handler cannot own logout.
    return !!source && source.epoch !== getAuthEpoch() && !getToken('refresh_token');
  }

  client.use({
    // Keep an unread clone before fetch disturbs POST/PUT bodies. A later 401
    // can therefore replay the original request exactly once after refresh.
    onRequest: ({ request, id }) => {
      const headers = new Headers(request.headers);
      const token = getToken('access_token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      const next = new Request(request, { headers });
      replaySources.set(id, { request: next.clone(), accessToken: token, epoch: getAuthEpoch() });
      return next;
    },
    onResponse: async ({ response, schemaPath, id, options }) => {
      const source = replaySources.get(id);
      replaySources.delete(id);
      if (response.status !== 401 || schemaPath === '/login') return;

      // Never replay a request under a different signed-in account.
      if (source && source.epoch !== getAuthEpoch() && (getToken('access_token') || getToken('refresh_token'))) return;

      const currentToken = getToken('access_token');
      // Another request/tab may already have rotated the access token. Do not
      // rotate the refresh token a second time just because this request was
      // sent with the old token.
      if (source && currentToken && source.accessToken !== currentToken) {
        return replay(source, currentToken, options.fetch);
      }

      const refreshToken = getToken('refresh_token');
      const result = refreshToken ? await ensureRefreshed(refreshToken, source?.epoch ?? getAuthEpoch()) : 'rejected';
      if (result === 'rejected') {
        if (endSession(source)) pleaseLogin(router);
        return;
      }
      // Transient refresh failure: keep the session and surface the 401
      // instead of logging the user out over a hiccup.
      if (result === 'error' || !source) return;
      const token = getToken('access_token');
      if (!token) return;
      return replay(source, token, options.fetch);
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
