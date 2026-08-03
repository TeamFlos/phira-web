<i18n>
en:
  title: Activate Account
  heading: Activate your Phira account
  prompt: Confirm to activate your account.
  confirm: Activate
  activating: Activating…
  missing-token: "This activation link is invalid: no token was provided."
  done: Your account is now activated. You can log in to Phira.

zh-CN:
  title: 激活账号
  heading: 激活你的 Phira 账号
  prompt: 点击下方按钮以激活你的账号。
  confirm: 激活
  activating: 激活中…
  missing-token: 此激活链接无效：未提供令牌。
  done: 你的账号已激活，现在可以登录 Phira 了。

zh-TW:
  title: 啟用帳號
  heading: 啟用你的 Phira 帳號
  prompt: 點擊下方按鈕以啟用你的帳號。
  confirm: 啟用
  activating: 啟用中…
  missing-token: 此啟用連結無效：未提供權杖。
  done: 你的帳號已啟用，現在可以登入 Phira 了。
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
const activating = ref(false);
const done = ref(false);

async function confirm() {
  if (activating.value || !token) return;
  activating.value = true;
  try {
    const resp = await fetch(`${API_BASE}/activate`, {
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
    setTimeout(() => router.push({ name: 'home' }), 1500);
  } catch (e) {
    toastError(e);
  } finally {
    activating.value = false;
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
          <p class="text-base-content/70">{{ t('prompt') }}</p>
          <p v-if="done" class="text-success">{{ t('done') }}</p>
          <div class="card-actions mt-2">
            <button class="btn btn-primary w-full" :disabled="done" @click="confirm">
              <LoadOr :loading="activating">{{ t('confirm') }}</LoadOr>
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
