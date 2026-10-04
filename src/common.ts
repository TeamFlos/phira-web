import type { Router } from 'vue-router';
import { onMounted } from 'vue';

import { toast as toastSonner } from 'vue-sonner';

import { SUPPORTED_LOCALES, i18n } from './main';
import { Roles, type User } from './model';

import moment from 'moment';

import 'moment/dist/locale/zh-cn';
import 'moment/dist/locale/zh-hk';

import ConfirmDialog from './components/ConfirmDialog.vue';

export const API_BASE = (import.meta.env.VITE_API_BASE || 'https://phira.5wyxi.com').replace(/\/$/, '');

export const LANGUAGES = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  'en-US': 'English',
};

export function userPermissions(user: User) {
  return Roles.from(user.roles).permissions(user.banned);
}

/**
 * A session still exists when either token is present: the 6h access token may
 * have lapsed while the 30d refresh token is fine, and the next API call then
 * transparently refreshes it (see `ensureSession` in `api/client`).
 */
export function loggedIn() {
  return !!(getToken('access_token') || getToken('refresh_token'));
}

export function setTitle(title: string) {
  document.title = title.length ? title + ' - Phira' : 'Phira';
}

export function changeLocale(locale: string) {
  if (locale.startsWith('en')) locale = 'en';
  if (!SUPPORTED_LOCALES.includes(locale)) locale = 'en';
  i18n.global.locale.value = (locale === 'zh-TW' ? 'zh-CN' : locale) as typeof i18n.global.locale.value;
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

export function userNameClass(badges: string[]): 'text-[#673ab7]' | 'text-[#ff7043]' | 'text-base-content' {
  if (badges.includes('admin')) return 'text-[#673ab7]';
  if (badges.includes('sponsor')) return 'text-[#ff7043]';
  return 'text-base-content';
}

export function pageCount(count: number, pageNum: number) {
  return count ? Math.floor((count - 1) / pageNum) + 1 : 0;
}

export function toast(msg: string, kind?: 'error' | 'success') {
  const func = kind === 'error' ? toastSonner.error : kind === 'success' ? toastSonner.success : toastSonner;
  func(msg, {
    duration: 2000,
  });
}
export function toastError(error: any) {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.length) toast(msg, 'error');
}

function legacyCopy(text: string): boolean {
  if (typeof document === 'undefined' || !document.body || typeof document.execCommand !== 'function') return false;

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.setAttribute('readonly', '');
  document.body.appendChild(textarea);

  try {
    textarea.select();
    return document.execCommand('copy');
  } finally {
    textarea.remove();
  }
}

export async function copyToClipboard(text: string): Promise<void> {
  const clipboard = typeof navigator === 'undefined' ? undefined : navigator.clipboard;
  if (clipboard && typeof clipboard.writeText === 'function') {
    try {
      await clipboard.writeText(text);
      return;
    } catch (error) {
      if (legacyCopy(text)) return;
      throw error;
    }
  }
  if (!legacyCopy(text)) throw new Error('Clipboard copy failed');
}

export function fileToURL(file: string) {
  // return file;
  return file.replace(/https:\/\/api.phira.cn\/files\//g, 'https://phira.5wyxi.com/files/');
}

export function validateEmail(t: any, email: string) {
  if (
    !/^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(email)
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

const cookieListener: (() => void)[] = [];

const AUTH_CHANGE_STORAGE_KEY = 'phira-auth-change';
let cookieBatchDepth = 0;
let cookieChangePending = false;

function notifyCookieListeners() {
  for (const listener of cookieListener) listener();
}

function broadcastCookieChange() {
  try {
    // Cookies do not generate an event in other tabs. A throw here is expected
    // in private browsing / storage-disabled environments, so cookie auth must
    // continue to work without the cross-tab notification.
    localStorage.setItem(AUTH_CHANGE_STORAGE_KEY, `${Date.now()}:${Math.random()}`);
  } catch {
    // Ignore storage failures; the cookie remains the source of truth.
  }
}

function triggerCookie() {
  if (cookieBatchDepth) {
    cookieChangePending = true;
    return;
  }
  notifyCookieListeners();
  broadcastCookieChange();
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === AUTH_CHANGE_STORAGE_KEY) notifyCookieListeners();
  });
}

/** Apply a group of cookie changes as one observable auth-state transition. */
export function batchCookieChanges(action: () => void) {
  cookieBatchDepth++;
  try {
    action();
  } finally {
    cookieBatchDepth--;
    if (!cookieBatchDepth && cookieChangePending) {
      cookieChangePending = false;
      triggerCookie();
    }
  }
}

/** Every auth cookie is stored at the site root so its scope doesn't depend on
 * which page happened to (re)write it. */
export const COOKIE_PATH = '/';

/**
 * Cookies written by older builds omitted `path`, so the browser scoped them
 * to the directory of whatever page stored the token (`/chart`, `/user/123`,
 * …). They survive logout from other pages and pollute the jar, so every
 * write/delete also expires a same-named cookie on every ancestor directory of
 * the current URL — exactly the scopes the old default `path` could have
 * produced. Cookies on paths this code cannot reach are neutralized by the
 * logout flag / shallowest-path reads instead.
 */
function legacyCookiePaths(): string[] {
  const paths: string[] = [];
  const pathname = location.pathname;
  const segments = pathname.split('/').filter(Boolean);
  const directoryCount = pathname.endsWith('/') ? segments.length : segments.length - 1;
  let path = '';
  for (let i = 0; i < directoryCount; i++) {
    path += `/${segments[i]}`;
    paths.push(path);
  }
  return paths;
}

export function setCookie(key: string, value: string, expires: string) {
  document.cookie = `${key}=${encodeURIComponent(value)}; expires=${expires}; path=${COOKIE_PATH}; SameSite=None; Secure`;
  for (const path of legacyCookiePaths()) {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; SameSite=None; Secure`;
  }
  triggerCookie();
}

export function deleteCookie(key: string) {
  const expired = 'Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = `${key}=; expires=${expired}; Max-Age=0; path=${COOKIE_PATH}; SameSite=None; Secure`;
  for (const path of legacyCookiePaths()) {
    document.cookie = `${key}=; expires=${expired}; Max-Age=0; path=${path}; SameSite=None; Secure`;
  }
  triggerCookie();
}

/**
 * Root-scoped flag set by `logout()`. Tokens are written at the site root, but
 * older builds used the browser default `path` (the directory of whichever
 * page happened to store/refresh them), so a logout can only delete the scopes
 * visible from its own URL. Stale same-named cookies on other paths would
 * otherwise be read again once the user navigates there, so while this flag is
 * set every token cookie is ignored — the next successful login clears it.
 */
const LOGGED_OUT_COOKIE = 'auth_logged_out';

/** 30d, so the flag outlives any refresh token left behind by an old build. */
function authCookieExpiry(): string {
  return new Date(Date.now() + 30 * 86400 * 1000).toUTCString();
}

function newAuthEpoch(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now()}-${Math.random()}`;
}

/**
 * Changes whenever the active auth state is replaced. Refresh responses keep
 * the epoch they started with; this prevents a late response from resurrecting
 * a session after logout or overwriting a newer login.
 */
export function getAuthEpoch(): string {
  return getCookie('auth_epoch') ?? '';
}

export function rotateAuthEpoch(): string {
  const epoch = newAuthEpoch();
  setCookie('auth_epoch', epoch, authCookieExpiry());
  return epoch;
}

/** Whether a logout happened in this browser since the last successful login. */
export function isLoggedOut(): boolean {
  return getCookie(LOGGED_OUT_COOKIE) !== undefined;
}

/**
 * Read an auth token. Unlike raw `getCookie`, this ignores everything left
 * behind by a logout and is what `access_token` / `refresh_token` readers
 * must use.
 */
export function getToken(name: string): string | undefined {
  if (isLoggedOut()) return undefined;
  return getCookie(name);
}

/** A fresh login (or refresh) supersedes the logout flag. */
export function clearLogoutFlag() {
  deleteCookie(LOGGED_OUT_COOKIE);
}

export function logout(expectedEpoch?: string): boolean {
  if (expectedEpoch !== undefined && getAuthEpoch() !== expectedEpoch) return false;
  batchCookieChanges(() => {
    // The epoch and flag are written before deleting tokens. The batch keeps
    // listeners from observing any of those intermediate states.
    rotateAuthEpoch();
    setCookie(LOGGED_OUT_COOKIE, '1', authCookieExpiry());
    deleteCookie('access_token');
    deleteCookie('refresh_token');
  });
  return true;
}

/**
 * Read a cookie by name. When several cookies share the name (legacy
 * directory-scoped writes), the shallowest path wins: browsers list longer
 * paths first, so the last match is the site-root cookie this code writes.
 */
export function getCookie(name: string): string | undefined {
  const prefix = `${name}=`;
  let raw: string | undefined;
  for (const part of document.cookie.split(';')) {
    const item = part.trim();
    if (!item.startsWith(prefix)) continue;
    raw = item.slice(prefix.length);
  }
  if (raw === undefined) return undefined;
  try {
    return decodeURIComponent(raw);
  } catch {
    // Cookies written before values were encoded may contain stray `%`.
    return raw;
  }
}

export function addCookieListener(listener: () => void) {
  cookieListener.push(listener);
  listener();
}

export function pleaseLogin(router: Router) {
  router.push('/login');
  toast(i18n.global.t('please-login'), 'error');
}

export type IConfirmDialog = InstanceType<typeof ConfirmDialog>;

export function useAds() {
  onMounted(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.error('adsbygoogle push failed', e);
    }
  });
  return {
    enabled: import.meta.env.VITE_NO_ADS !== '1',
  };
}
