<i18n>
en:
  state-awaiting_first_review: Awaiting review
  state-awaiting_collaborators: Awaiting collaborators
  state-published: Published
  state-has_pending_edit: Edit in review
  state-rejected_edit: Edit rejected
  hidden-badge: Hidden
  stable: Stable
  stable-req: Stable review
  deny-reason: Rejection reason
  deny-no-reason: The rejection reason was sent to your in-game inbox.
  plays: plays
  collabs: Collaborators
  unconfirmed: unconfirmed
  no-ratings: No ratings
  updated: Updated
  visibility: Visibility
  vis-hide: Hide
  vis-hide-desc: Hidden charts disappear from public listings; players who already collected it keep access. You can make it visible again at any time.
  vis-show: Make visible
  vis-show-desc: The chart will return to public listings.

zh-CN:
  state-awaiting_first_review: 待审核
  state-awaiting_collaborators: 等待协作者确认
  state-published: 已上架
  state-has_pending_edit: 修改审核中
  state-rejected_edit: 修改被拒绝
  hidden-badge: 已隐藏
  stable: 稳定版
  stable-req: 稳定版审核
  deny-reason: 打回理由
  deny-no-reason: 打回理由已发送至游戏内收件箱。
  plays: 次游玩
  collabs: 协作者
  unconfirmed: 未确认
  no-ratings: 暂无评分
  updated: 更新于
  visibility: 可见性
  vis-hide: 隐藏
  vis-hide-desc: 隐藏后谱面将从公开列表消失，已收藏的玩家仍可访问。随时可重新设为可见。
  vis-show: 设为可见
  vis-show-desc: 谱面将重新出现在公开列表中。
</i18n>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { detailedTime } from '../common';
import { useApi } from '../api/client';
import type { MyChartEntry, ReviewState } from '../model';

import ConfirmDialog from './ConfirmDialog.vue';

const props = defineProps<{ entry: MyChartEntry }>();
const emit = defineEmits<{ refresh: [] }>();

const { t } = useI18n();
const api = useApi();

const REVIEW_STATE_CLASS: Record<ReviewState, string> = {
  published: 'badge-success',
  awaiting_first_review: 'badge-info',
  has_pending_edit: 'badge-info',
  awaiting_collaborators: 'badge-warning',
  rejected_edit: 'badge-error',
};

const visDialog = ref<InstanceType<typeof ConfirmDialog>>();

async function applyVisibility() {
  const { error } = await api.PATCH('/chart/{id}/visibility', {
    params: { path: { id: props.entry.id } },
    body: { hidden: !props.entry.hidden },
    toastError: true,
  });
  if (error) throw error;
  emit('refresh');
}
</script>

<template>
  <div class="card bg-base-100 shadow-lg overflow-hidden">
    <div class="flex flex-col sm:flex-row">
      <div class="card-body grow min-w-0 p-4 gap-1">
        <div class="flex flex-wrap items-baseline gap-x-3">
          <h2 class="card-title truncate">
            <router-link :to="`/chart/${entry.id}`" class="hover:link">{{ entry.name }}</router-link>
          </h2>
          <span class="text-sm opacity-70 truncate">{{ entry.composer }} · {{ t('updated') }} {{ detailedTime(entry.chartUpdated) }}</span>
        </div>
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span class="flex items-center gap-1">
            <i class="fa-solid fa-star text-yellow-500"></i>
            <template v-if="entry.rating != null">
              <span>{{ entry.rating.toFixed(1) }}</span>
              <span class="opacity-50">({{ entry.ratingCount }})</span>
            </template>
            <span v-else class="opacity-50">{{ t('no-ratings') }}</span>
          </span>
          <span class="flex items-center gap-1 opacity-70">
            <i class="fa-solid fa-play"></i>
            {{ entry.playCount }} {{ t('plays') }}
          </span>
          <span v-if="entry.collaborators.length" class="flex items-center gap-1 opacity-70">
            <i class="fa-solid fa-user-group"></i>
            {{ t('collabs') }}:
            <template v-for="(c, i) in entry.collaborators" :key="c.userId">
              <span v-if="i">·</span>
              {{ c.name }}<span v-if="!c.confirmed" class="opacity-50">({{ t('unconfirmed') }})</span>
            </template>
          </span>
        </div>
        <div class="flex flex-wrap gap-2 mt-1">
          <span class="badge" :class="REVIEW_STATE_CLASS[entry.reviewState]">{{ t(`state-${entry.reviewState}`) }}</span>
          <span v-if="entry.hidden" class="badge badge-ghost">{{ t('hidden-badge') }}</span>
          <span v-if="entry.stable" class="badge badge-accent">{{ t('stable') }}</span>
          <span v-else-if="entry.stableRequest" class="badge badge-warning">{{ t('stable-req') }}</span>
        </div>
        <div v-if="entry.reviewState === 'rejected_edit'" class="alert alert-warning mt-2 p-3 text-sm">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <div>
            <span class="font-bold">{{ t('deny-reason') }}</span>
            <p v-if="entry.denyReason" class="whitespace-pre-line">{{ entry.denyReason }}</p>
            <p v-else class="opacity-70">{{ t('deny-no-reason') }}</p>
          </div>
        </div>
      </div>
      <div class="flex-none flex sm:flex-col items-center justify-between sm:justify-center gap-2 p-4 sm:w-40">
        <button class="btn btn-sm btn-outline sm:w-full" @click="visDialog?.showModal()">{{ t('visibility') }}</button>
      </div>
    </div>

    <ConfirmDialog ref="visDialog" :do="applyVisibility" :confirmText="t(entry.hidden ? 'vis-show' : 'vis-hide')">
      <p>{{ t(entry.hidden ? 'vis-show-desc' : 'vis-hide-desc') }}</p>
    </ConfirmDialog>
  </div>
</template>
