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
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { getCookie, pageCount, pleaseLogin } from '../common';
import { useApi } from '../api/client';
import type { MyChartEntry } from '../model';

import LoadView from '../components/LoadView.vue';
import MyChartRow from '../components/MyChartRow.vue';
import PageIndicator from '../components/PageIndicator.vue';

const PAGE_NUM = 5;

const { t } = useI18n();
const api = useApi();
const router = useRouter();

if (!getCookie('access_token')) {
  pleaseLogin(router);
}

const entries = ref<MyChartEntry[]>();
const pager = ref<InstanceType<typeof PageIndicator>>();
const page = ref(1);

// `/me/charts` returns the whole list in one shot (pipeline state, denial
// reason, collaborators included), so pagination is a client-side slice —
// no refetch on page turn, no pager/fetch feedback loop.
const pageRows = computed(() => entries.value?.slice((page.value - 1) * PAGE_NUM, page.value * PAGE_NUM));

watch(
  () => pager.value?.current,
  (current) => {
    page.value = current ?? 1;
  },
);

async function fetchCharts() {
  try {
    const { data } = await api.GET('/me/charts', { toastError: true });
    if (data) entries.value = data.results;
  } catch {
    // toast already shown by the client wrapper; the page stays on its shell
  }
}

if (getCookie('access_token')) {
  await fetchCharts();
}
</script>

<template>
  <div class="flex justify-center w-full">
    <div class="flex flex-col gap-4 w-full max-w-4xl p-8">
      <h1 class="text-2xl font-bold">{{ t('heading') }}</h1>
      <LoadView v-if="!entries" />
      <template v-else-if="entries.length">
        <MyChartRow v-for="entry in pageRows" :key="entry.id" :entry="entry" @refresh="fetchCharts" />
        <PageIndicator :total="pageCount(entries.length, PAGE_NUM)" class="self-center mt-4" ref="pager" />
      </template>
      <div v-else class="flex flex-col items-center gap-1 p-8">
        <p class="italic opacity-60">{{ t('empty') }}</p>
        <p class="text-sm opacity-50">{{ t('empty-hint') }}</p>
      </div>
    </div>
  </div>
</template>
