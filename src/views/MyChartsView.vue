<i18n>
en:
  heading: My Charts
  empty: No submissions yet
  empty-hint: Charts you upload from the game client will show up here.

zh-CN:
  heading: 稿件中心
  empty: 还没有投稿
  empty-hint: 从游戏客户端上传的谱面会出现在这里。
</i18n>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { loggedIn, pageCount, pleaseLogin } from '../common';
import { useApi } from '../api/client';
import type { MyChartEntry } from '../model';

import LoadView from '../components/LoadView.vue';
import MyChartRow from '../components/MyChartRow.vue';
import PageIndicator from '../components/PageIndicator.vue';

const PAGE_NUM = 5;

const { t } = useI18n();
const api = useApi();
const router = useRouter();

const entries = ref<MyChartEntry[]>();
const totalCount = ref(0);
const pager = ref<InstanceType<typeof PageIndicator>>();
const page = ref(1);
let requestId = 0;

watch(
  () => pager.value?.current,
  (current) => {
    if (current === undefined || current === page.value) return;
    page.value = current;
    fetchCharts();
  },
);

async function fetchCharts() {
  const id = ++requestId;
  try {
    const { data } = await api.GET('/me/charts', {
      params: { query: { page: page.value, pageSize: PAGE_NUM } },
      toastError: true,
    });
    if (data && id === requestId) {
      entries.value = data.results;
      totalCount.value = data.count;
    }
  } catch {
    // toast already shown by the client wrapper; the page stays on its shell
  }
}

if (!loggedIn()) {
  pleaseLogin(router);
} else {
  await fetchCharts();
}
</script>

<template>
  <div class="flex justify-center w-full">
    <div class="flex flex-col gap-4 w-full max-w-4xl p-8">
      <h1 class="text-2xl font-bold">{{ t('heading') }}</h1>
      <LoadView v-if="!entries" />
      <template v-else-if="entries.length">
        <MyChartRow v-for="entry in entries" :key="entry.id" :entry="entry" @refresh="fetchCharts" />
        <PageIndicator :total="pageCount(totalCount, PAGE_NUM)" class="self-center mt-4" ref="pager" />
      </template>
      <div v-else class="flex flex-col items-center gap-1 p-8">
        <p class="italic opacity-60">{{ t('empty') }}</p>
        <p class="text-sm opacity-50">{{ t('empty-hint') }}</p>
      </div>
    </div>
  </div>
</template>
