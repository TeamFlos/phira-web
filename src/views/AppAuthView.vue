<i18n>
en:
  heading: Log in from Phira
  prompt: 'You are about to log in to the website as:'
  switch-account: You are currently logged in to another account on this website. Confirming will switch to this account.
  confirm: Confirm login
  invalid: This login link is invalid or has expired. Please open it again from the game.
  logged-in: Logged in

  pending-delete:
    title: Account deletion pending
    message: Your account has a pending deletion request. Continue logging in to cancel it?
    cancel-delete: Cancel deletion & log in

zh-CN:
  heading: 从 Phira 客户端登录
  prompt: 你即将在网页端登录以下账号：
  switch-account: 你当前已在网页端登录了其他账号，确认后将切换到该账号。
  confirm: 确认登录
  invalid: 此登录链接无效或已过期，请回到客户端重新打开。
  logged-in: 登录成功

  pending-delete:
    title: 账号删除请求待处理
    message: 你的账号有一个待处理的删除请求。是否撤销删除并继续登录？
    cancel-delete: 撤销删除并登录

zh-TW:
  heading: 從 Phira 用戶端登入
  prompt: 你即將在網頁端登入以下帳號：
  switch-account: 你目前已在網頁端登入了其他帳號，確認後將切換到該帳號。
  confirm: 確認登入
  invalid: 此登入連結無效或已過期，請回到用戶端重新開啟。
  logged-in: 登入成功

  pending-delete:
    title: 帳號刪除請求待處理
    message: 你的帳號有一個待處理的刪除請求。是否撤銷刪除並繼續登入？
    cancel-delete: 撤銷刪除並登入
</i18n>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { API_BASE, loggedIn, toast, toastError, changeLocale, type IConfirmDialog } from '../common';
import { storeTokens } from '../api/client';

import LoadOr from '../components/LoadOr.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import UserAvatar from '../components/UserAvatar.vue';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

// The client opens `/auth/app#ticket=<ticket>&to=<path>`. The ticket rides in
// the fragment so it never reaches the server's access logs or a Referer; it is
// single-use and short-lived, so its lingering in browser history is harmless.
const params = new URLSearchParams(route.hash.slice(1));
const ticket = params.get('ticket') ?? '';

/** Only same-site absolute paths are honored, so the page can't be used as an open redirect. */
function redirectTarget(): string {
  const to = params.get('to');
  return to && to.startsWith('/') && !to.startsWith('//') && !to.startsWith('/\\') ? to : '/';
}

const target = ref<{ id: number; name: string; avatar?: string | null }>();
const invalid = ref(false);
const alreadyLoggedIn = loggedIn();
const doingLogin = ref(false);
const deleteRequestDialog = ref<IConfirmDialog>();

onMounted(async () => {
  if (!ticket) {
    invalid.value = true;
    return;
  }
  try {
    const resp = await fetch(`${API_BASE}/web-ticket/${encodeURIComponent(ticket)}`);
    if (!resp.ok) throw new Error();
    target.value = await resp.json();
  } catch {
    invalid.value = true;
  }
});

async function performLogin(cancelDeleteRequest = false) {
  const resp = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ webTicket: ticket, cancelDeleteRequest }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    if (data.code === 'PENDING_DELETE_REQUEST' && !cancelDeleteRequest) {
      deleteRequestDialog.value?.showModal();
      return;
    }
    if (data.code === 'UNAUTHENTICATED') invalid.value = true;
    throw new Error(data.error || `${resp.status} ${resp.statusText}`.trim());
  }
  storeTokens(data);
  toast(t('logged-in'));
  router.replace(redirectTarget());
  fetch(`${API_BASE}/me`, { headers: { Authorization: `Bearer ${data.token}` } })
    .then((r) => r.json())
    .then((me) => me?.language && changeLocale(me.language))
    .catch(() => {});
}

async function confirm() {
  if (doingLogin.value) return;
  doingLogin.value = true;
  try {
    await performLogin();
  } catch (e) {
    toastError(e);
  } finally {
    doingLogin.value = false;
  }
}
</script>

<template>
  <div class="flex justify-center items-center p-8">
    <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100 mt-16">
      <div class="card-body gap-4">
        <h2 class="card-title">{{ t('heading') }}</h2>
        <p v-if="invalid" class="text-error">{{ t('invalid') }}</p>
        <div v-else-if="!target" class="flex justify-center">
          <div class="loading loading-spinner"></div>
        </div>
        <template v-else>
          <p class="text-base-content/70">{{ t('prompt') }}</p>
          <div class="flex flex-row items-center">
            <div class="avatar">
              <div class="w-12 mask mask-squircle">
                <UserAvatar :url="target.avatar" />
              </div>
            </div>
            <p class="font-black text-xl mx-2">{{ target.name }}</p>
          </div>
          <div v-if="alreadyLoggedIn" class="alert alert-warning text-sm">{{ t('switch-account') }}</div>
          <div class="card-actions mt-2">
            <button class="btn btn-primary w-full" :disabled="doingLogin" @click="confirm">
              <LoadOr :loading="doingLogin">{{ t('confirm') }}</LoadOr>
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
  <ConfirmDialog :do="() => performLogin(true)" :confirm-text="t('pending-delete.cancel-delete')" ref="deleteRequestDialog">
    <h3 class="text-lg font-bold" v-t="'pending-delete.title'"></h3>
    <p class="py-2" v-t="'pending-delete.message'"></p>
  </ConfirmDialog>
</template>
