<script setup lang="ts">

import { ref, watch, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

import { useFetchApi, fileToURL, pageCount } from './common'
import type { Chart, Page } from './model'

import Loader from './components/Loader.vue'
import Pagination from './components/Pagination.vue'

const PAGE_NUM = 28;

const router = useRouter();

const fetchApi = useFetchApi();

const pagination = ref<typeof Pagination>();

const totalCount = ref(0);
const charts = ref<Chart[]>();

const init = router.currentRoute.value.query;
const initPage = parseInt(String(init['page'])) || 1;

const parameters = computed(() => {
  return {
    page: String(pagination.value?.current ?? initPage),
  };
});

async function fetchCharts() {
  charts.value = undefined;
  let params = {
    pageNum: String(PAGE_NUM),
    ...parameters.value
  };
  const resp = await fetchApi('/chart?' + new URLSearchParams(params)) as Page<Chart>;
  totalCount.value = resp.count;
  charts.value = resp.results;
}

await fetchCharts();

onMounted(() => {
  watch(parameters, (params) => {
    fetchCharts(); // do not wait
    router.push({ query: params });
  });
});

</script>

<style>

.chart-card {
  animation: button-pop var(--animation-btn, 0.25s) ease-out;
}

.chart-card:active:hover, .chart-card:active:focus {
  animation: button-press 0.25s ease-out;
  transform: scale(0.97);
}

@keyframes button-press {
  from {
    transform: scale(1.0);
  }

  to {
    transform: scale(0.97);
  }
}

</style>

<template>
  <div class="flex flex-col items-center mt-8">
    <div class="mx-8 lg:w-3/4">
      <div v-if="charts" class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <router-link v-for="chart in charts" :key="chart.id" :to="`/chart/${chart.id}`" class="group card relative image-full bg-base-100 shadow-xl aspect-[8/5] illustration chart-card">
          <figure><img :src="fileToURL(chart.illustration) + '.thumbnail'" /></figure>
          <div class="absolute right-0 badge badge-primary z-[11] m-2 text-lg p-3">{{ chart.level }}</div>
          <div class="card-body flex-col justify-end p-4 gap-0">
            <p class="flex-none text-sm">{{ chart.composer }}</p>
            <h2 class="card-title group-hover:link">{{ chart.name }}</h2>
          </div>
        </router-link>
      </div>
      <div v-if="!charts" class="flex flex-col items-center w-full h-16 mb-8">
        <Loader class="m-8 loading-lg"/>
      </div>
    </div>
    <Pagination :init="initPage" :total="pageCount(totalCount, PAGE_NUM)" class="mt-8 mb-16" ref="pagination" />
  </div>
</template>
