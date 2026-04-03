<i18n>
en:
  title: Collaboration Invitation
  chart: Chart
  role: Role
  inviter: Inviter
  no-role: (no specific role)
  confirm: Confirm
  confirmed: Joined collaboration successfully.
  already-confirmed: You have already confirmed this collaboration.

zh-CN:
  title: 协作邀请
  chart: 谱面
  role: 角色
  inviter: 邀请者
  no-role: （无特定角色）
  confirm: 确认加入
  confirmed: 已成功加入协作。
  already-confirmed: 你已确认过此协作。

zh-TW:
  title: 協作邀請
  chart: 譜面
  role: 角色
  inviter: 邀請者
  no-role: （無特定角色）
  confirm: 確認加入
  confirmed: 已成功加入協作。
  already-confirmed: 你已確認過此協作。
</i18n>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { useFetchApi, toastError, toast, userNameClass } from '../common';
import type { Chart, UserView } from '../model';

import LoadOr from '../components/LoadOr.vue';
import UserAvatar from '../components/UserAvatar.vue';

const router = useRouter();
const route = useRoute();

const hash = route.query.hash as string;

const fetchApi = useFetchApi();

type CollabInfo = {
  chart: Chart;
  role: string | null;
  confirmed: boolean;
};

const info = (await fetchApi(`/chart/collab/${hash}`)) as CollabInfo;
if (info.confirmed) {
  toast(t('already-confirmed'));
  router.push({ name: 'home' });
}

const inviter = ref<UserView>();
fetchApi(`/user/${info.chart.uploader}`, {}, (u) => (inviter.value = u as UserView));

const confirming = ref(false);

async function confirm() {
  if (confirming.value) return;
  confirming.value = true;
  try {
    await fetchApi(`/chart/collab/${hash}/confirm`, { method: 'POST' });
    toast(t('confirmed'));
    router.push({ name: 'home' });
  } catch (e) {
    toastError(e);
  } finally {
    confirming.value = false;
  }
}
</script>

<template>
  <div class="flex justify-center items-center p-8">
    <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100 mt-16">
      <div class="card-body gap-4">
        <h2 class="card-title">{{ t('title') }}</h2>
        <div class="flex items-center gap-4">
          <img :src="info.chart.illustration" class="w-20 h-20 rounded-lg object-cover shadow" />
          <div class="flex flex-col gap-1">
            <span class="font-bold text-lg">{{ info.chart.name }}</span>
            <span class="text-sm text-base-content/60">{{ info.chart.composer }}</span>
          </div>
        </div>
        <div class="divider my-0"></div>
        <div class="flex justify-between items-center text-sm">
          <span class="font-medium">{{ t('inviter') }}</span>
          <router-link v-if="inviter" :to="`/user/${inviter.id}`" class="flex items-center gap-2 hover:opacity-80">
            <div class="avatar">
              <div class="w-6 mask mask-squircle">
                <UserAvatar :url="inviter.avatar" />
              </div>
            </div>
            <span :class="[userNameClass(inviter.badges)]">{{ inviter.name }}</span>
          </router-link>
          <span v-else class="loading loading-spinner loading-xs"></span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="font-medium">{{ t('role') }}</span>
          <span class="text-base-content/70">{{ info.role ?? t('no-role') }}</span>
        </div>
        <div class="card-actions mt-2">
          <button class="btn btn-primary w-full" @click="confirm">
            <LoadOr :loading="confirming">{{ t('confirm') }}</LoadOr>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
