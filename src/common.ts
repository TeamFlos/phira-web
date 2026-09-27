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
  return !!(getCookie('access_token') || getCookie('refresh_token'));
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

function triggerCookie() {
  for (const listener of cookieListener) listener();
}

/** Every auth cookie is stored at the site root so its scope doesn't depend on
 * which page happened to (re)write it. */
export const COOKIE_PATH = '/';

/**
 * Cookies written by older builds omitted `path`, so the browser scoped them
 * to the directory of whatever page stored the token (`/chart`, `/user/123`,
 * …). Such leftovers shadow the real cookie and survive logout from other
 * pages, so every write/delete also expires a same-named cookie on every
 * ancestor directory of the current URL — exactly the scopes the old default
 * `path` could have produced.
 */
function legacyCookiePaths(): string[] {
  const paths: string[] = [];
  const segments = location.pathname.split('/').filter(Boolean);
  let path = '';
  for (let i = 0; i < segments.length - 1; i++) {
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

export function logout() {
  deleteCookie('access_token');
  deleteCookie('refresh_token');
}

/**
 * First exact-name match wins. Browsers list cookies by descending path
 * length, so a second same-named cookie (from the old directory-scoped
 * writes) no longer masks the value, as it did when the split-based lookup
 * required exactly one match.
 */
export function getCookie(name: string): string | undefined {
  const prefix = `${name}=`;
  for (const part of document.cookie.split(';')) {
    const item = part.trim();
    if (!item.startsWith(prefix)) continue;
    const raw = item.slice(prefix.length);
    try {
      return decodeURIComponent(raw);
    } catch {
      // Cookies written before values were encoded may contain stray `%`.
      return raw;
    }
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
