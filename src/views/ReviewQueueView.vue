<i18n>
en:
  title: Review Queue
  subtitle: Charts awaiting a review decision, oldest submission first.
  empty: Nothing to review right now.
  voted: 'Already voted:'
  no-vote: No votes yet
  uploader: Uploader
  review: Review

zh-CN:
  title: 待审队列
  subtitle: 等待审核的谱面，提交较早的排在前面。
  empty: 暂无待审谱面。
  voted: 已投票：
  no-vote: 暂无投票
  uploader: 上传者
  review: 审核
</i18n>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import moment from 'moment';

import { fileToURL, pageCount } from '../common';
import { useApi } from '../api/client';
import type { ReviewQueueItem } from '../model';

import LoadView from '../components/LoadView.vue';
import PageIndicator from '../components/PageIndicator.vue';
import UserAvatar from '../components/UserAvatar.vue';

const { t } = useI18n();
const api = useApi();

const PAGE_NUM = 20;

const items = ref<ReviewQueueItem[]>();
const totalCount = ref(0);
const pagination = ref<typeof PageIndicator>();

async function load(page: number) {
  items.value = undefined;
  const { data, error } = await api.GET('/chart/review-queue', {
    params: { query: { page, pageNum: PAGE_NUM } },
    toastError: true,
  });
  if (error || !data) {
    items.value = [];
    return;
  }
  items.value = data.results as ReviewQueueItem[];
  totalCount.value = data.count;
}

await load(1);

watch(
  () => pagination.value?.current,
  (page) => {
    if (page !== undefined) load(page);
  },
);

/** Deep-link straight to the version actually under review. */
function target(item: ReviewQueueItem): string {
  const base = `/chart/${item.chart.id}/versions`;
  return item.pendingVersionId ? `${base}/${item.pendingVersionId}` : base;
}
</script>

<template>
  <div class="flex flex-col items-center px-4 lg:px-0 mb-24">
    <div class="w-full lg:w-3/4 flex flex-col gap-4">
      <div>
        <h1 class="text-3xl font-black">{{ t('title') }}</h1>
        <p class="opacity-70 mt-1" v-t="'subtitle'"></p>
      </div>

      <LoadView v-if="!items" class="mx-auto loading-lg my-16" />
      <p v-else-if="!items.length" class="italic opacity-60 py-16 text-center" v-t="'empty'"></p>

      <router-link
        v-for="item in items"
        :key="item.chart.id"
        :to="target(item)"
        class="card bg-base-100 border border-base-300 shadow-lg p-3 flex flex-row items-center gap-4 hover:bg-base-200 hover:border-primary transition-colors">
        <img class="w-32 shrink-0 aspect-[8/5] object-cover rounded-lg border border-base-300" :src="fileToURL(item.chart.illustration) + '.thumbnail'" />
        <div class="flex flex-col min-w-0 grow gap-1">
          <span class="text-sm opacity-70 truncate">{{ item.chart.composer }}</span>
          <div class="flex items-center gap-2 min-w-0">
            <span class="font-bold truncate">{{ item.chart.name }}</span>
            <span class="badge badge-primary shrink-0">{{ item.chart.level }}</span>
          </div>
          <span class="text-xs opacity-60">{{ moment(item.chart.chartUpdated).fromNow() }}</span>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs opacity-70" v-t="item.reviewedBy.length ? 'voted' : 'no-vote'"></span>
            <div class="flex -space-x-2">
              <UserAvatar
                v-for="reviewer in item.reviewedBy"
                :key="reviewer.id"
                class="w-6 h-6 rounded-full ring-2 ring-base-100"
                :url="reviewer.avatar"
                v-tooltip="reviewer.name" />
            </div>
          </div>
        </div>
        <span class="btn btn-sm btn-primary shrink-0 hidden sm:inline-flex" v-t="'review'"></span>
      </router-link>

      <PageIndicator v-if="totalCount > PAGE_NUM" :total="pageCount(totalCount, PAGE_NUM)" class="mt-4" ref="pagination" />
    </div>
  </div>
</template>
