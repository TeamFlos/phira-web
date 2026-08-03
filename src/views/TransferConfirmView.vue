<i18n>
en:
  title: Confirm Account Transfer
  heading: Confirm account transfer
  warning: You are about to migrate an account's data onto a 3839 Games login.
  detail: After confirming, this account can be logged into directly with 3839 Games. If this request was started by someone else, the account may be taken over by them. The data on the original 3839 Games account will be permanently deleted and cannot be undone.
  confirm: Confirm transfer
  transferring: Transferring…
  missing-token: "This confirmation link is invalid: no token was provided."
  done: Transfer complete. Please log out in the game and log in again to update the binding status.

zh-CN:
  title: 确认账号迁移
  heading: 确认账号迁移
  warning: 你即将把一个账号的数据迁移到好游快爆登录方式。
  detail: 确认后，该账号将可以直接使用好游快爆登录。如果此请求由他人发起，你的账号可能被他人接管。原好游快爆账号上的数据将被永久删除，且无法撤销。
  confirm: 确认迁移
  transferring: 迁移中…
  missing-token: 此确认链接无效：未提供令牌。
  done: 迁移完成。请在游戏中退出登录并重新登录以更新绑定状态。

zh-TW:
  title: 確認帳號遷移
  heading: 確認帳號遷移
  warning: 你即將把一個帳號的資料遷移到好遊快爆登入方式。
  detail: 確認後，該帳號將可以直接使用好遊快爆登入。如果此請求由他人發起，你的帳號可能被他人接管。原好遊快爆帳號上的資料將被永久刪除，且無法撤銷。
  confirm: 確認遷移
  transferring: 遷移中…
  missing-token: 此確認連結無效：未提供權杖。
  done: 遷移完成。請在遊戲中登出並重新登入以更新綁定狀態。
</i18n>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { API_BASE, toast, toastError } from '../common';
import LoadOr from '../components/LoadOr.vue';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const token = (route.query.token as string) || '';
const transferring = ref(false);
const done = ref(false);

async function confirm() {
  if (transferring.value || !token) return;
  transferring.value = true;
  try {
    const resp = await fetch(`${API_BASE}/user/transfer/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}) as { error?: string });
      throw new Error(body.error || 'failed');
    }
    done.value = true;
    toast(t('done'), 'success');
    setTimeout(() => router.push({ name: 'home' }), 2500);
  } catch (e) {
    toastError(e);
  } finally {
    transferring.value = false;
  }
}
</script>

<template>
  <div class="flex justify-center items-center p-8">
    <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100 mt-16">
      <div class="card-body gap-4">
        <h2 class="card-title">{{ t('heading') }}</h2>
        <template v-if="!token">
          <p class="text-error">{{ t('missing-token') }}</p>
        </template>
        <template v-else>
          <div class="alert alert-warning">
            <div>
              <p class="font-semibold">{{ t('warning') }}</p>
              <p class="text-sm mt-1">{{ t('detail') }}</p>
            </div>
          </div>
          <p v-if="done" class="text-success">{{ t('done') }}</p>
          <div class="card-actions mt-2">
            <button class="btn btn-warning w-full" :disabled="done" @click="confirm">
              <LoadOr :loading="transferring">{{ t('confirm') }}</LoadOr>
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
