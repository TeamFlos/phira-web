<script setup lang="ts">
import { ref, reactive, watch } from 'vue';

import { useFetchApi, fileToURL } from '../common';
import type { Chart, PlayRecord, PoolItem, PoolItemEx, RecordPool } from '../model';

import LoadView from './LoadView.vue';

const props = defineProps<{
  player: number;
  params?: Record<string, string>;
}>();

const fetchApi = useFetchApi();

const bestRecords = ref<ReturnType<typeof reactive<PoolItemEx>>[]>();
bestRecords.value = undefined;

const recentRecords = ref<ReturnType<typeof reactive<PoolItemEx>>[]>();
  recentRecords.value = undefined;

async function fetchRecords() {
  let resp = (await fetchApi('/record/get-pool/' + props.player)) as RecordPool;
  let bestPool: PoolItem[] = resp.bestPool;
  let transformed = [];
  for (let record of bestPool) {
    let r = reactive({ rks: record.rks, } as PoolItemEx);
    let rec = (await fetchApi('/record/' + record.record)) as PlayRecord;
    r.record = rec;
    fetchApi(`/chart/${record.chart}`, {}, (chart) => {
      r.chart = chart as Chart;
    });
    transformed.push(r);
  }
  bestRecords.value = transformed;
  let recentPool: PoolItem[] = resp.recentPool;
  transformed = [];
  for (let record of recentPool) {
    let r = reactive({ rks: record.rks, } as PoolItemEx);
    let rec = (await fetchApi('/record/' + record.record)) as PlayRecord;
    r.record = rec;
    fetchApi(`/chart/${record.chart}`, {}, (chart) => {
      r.chart = chart as Chart;
    });
    transformed.push(r);
  }
  recentRecords.value = transformed;
}

await fetchRecords();

watch(() => props.params, fetchRecords);

import icon_a from '@/assets/rank/a.webp';
import icon_b from '@/assets/rank/b.webp';
import icon_c from '@/assets/rank/c.webp';
import icon_f from '@/assets/rank/f.webp';
import icon_s from '@/assets/rank/s.webp';
import icon_v from '@/assets/rank/v.webp';
import icon_fc from '@/assets/rank/fc.webp';
import icon_phi from '@/assets/rank/phi.webp';

function getRankIcon(record: PlayRecord): string {
  if (record.score < 700000) {
    return icon_f;
  } else if (record.score < 820000) {
    return icon_c;
  } else if (record.score < 880000) {
    return icon_b;
  } else if (record.score < 920000) {
    return icon_a;
  } else if (record.score < 960000) {
    return icon_s;
  } else if (record.score < 1000000) {
    return record.full_combo ? icon_fc : icon_v;
  } else {
    return icon_phi;
  }
}
</script>

<template>
  <div class="grid grid-cols-1 gap-4 min-h-0 min-w-0">
    <LoadView v-if="!bestRecords" />
    <router-link v-for="record in bestRecords" :key="record.record?.id" :to="`/chart/${record.chart?.id}`"
      class="group card relative image-full bg-base-100 shadow-xl illustration interactive-card aspect-[6/1] lg:aspect-[9/1] min-h-0 min-w-0">
      <figure v-if="record?.chart">
        <img class="w-full aspect-[6/1] lg:aspect-[9/1]"
          :src="fileToURL(record?.chart?.illustration) + '.thumbnail'" />
      </figure>
      <div
        class="card-body flex flex-row items-center justify-start p-4 gap-0 group aspect-[6/1] lg:aspect-[9/1] min-h-0 min-w-0">
        <img :src="getRankIcon(record.record as PlayRecord)" class="h-10 xl:h-16 mr-2" />
        <div class="grow min-w-0">
          <p class="group-hover:link truncate w-auto">
            {{ record?.chart?.name }}
          </p>
          <p class="font-mono font-black text-3xl">
            {{ String(record.record?.std_score.toFixed(0)).padStart(7, '0') }}
          </p>
        </div>
        <div class="flex flex-col items-end justify-center">
          <p class="font-mono font-black text-xs md:text-lg lg:text-xl">
            {{ record?.chart?.difficulty.toFixed(2) }} -> {{ record.rks.toFixed(3) }}
          </p>
        </div>
      </div>
    </router-link>
    <div class="divider"></div>
    <LoadView v-if="!recentRecords" />
    <router-link v-for="record in recentRecords" :key="record.record?.id" :to="`/chart/${record.chart?.id}`"
      class="group card relative image-full bg-base-100 shadow-xl illustration interactive-card aspect-[6/1] lg:aspect-[9/1] min-h-0 min-w-0">
      <figure v-if="record?.chart">
        <img class="w-full aspect-[6/1] lg:aspect-[9/1]"
          :src="fileToURL(record?.chart?.illustration) + '.thumbnail'" />
      </figure>
      <div
        class="card-body flex flex-row items-center justify-start p-4 gap-0 group aspect-[6/1] lg:aspect-[9/1] min-h-0 min-w-0">
        <img :src="getRankIcon(record.record as PlayRecord)" class="h-10 xl:h-16 mr-2" />
        <div class="grow min-w-0">
          <p class="group-hover:link truncate w-auto">
            {{ record?.chart?.name }}
          </p>
          <p class="font-mono font-black text-3xl">
            {{ String(record.record?.std_score.toFixed(0)).padStart(7, '0') }}
          </p>
        </div>
        <div class="flex flex-col items-end justify-center">
          <p class="font-mono font-black text-xs md:text-lg lg:text-xl">
            {{ record?.chart?.difficulty.toFixed(2) }} -> {{ record.rks.toFixed(3) }}
          </p>
        </div>
      </div>
    </router-link>
  </div>
</template>
