<script setup lang="ts">

import { ref, reactive, watch } from 'vue'

import { useFetchApi, fileToURL } from '../common'
import type { Chart, PlayRecord } from '../model'

import Loader from './Loader.vue'

const props = defineProps<{ params?: Record<string, string>, limit?: number }>();

const fetchApi = useFetchApi();

type PlayRecordEx = PlayRecord & { chartDetail?: Chart };

const records = ref<ReturnType<typeof reactive<PlayRecordEx>>[]>();

async function fetchRecords() {
  records.value = undefined;
  let resp = await fetchApi('/record?' + new URLSearchParams(props.params ?? {})) as PlayRecordEx[];
  if (props.limit && resp.length > props.limit) {
    resp.splice(props.limit);
  }
  let transformed = [];
  for (let record of resp) {
    let r = reactive(record);
    fetchApi(`/chart/${record.chart}`, {}, (chart) => { r.chartDetail = chart as Chart; });
    transformed.push(r);
  }
  records.value = transformed;
}

await fetchRecords();

watch(() => props.params, fetchRecords);

</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-0 min-w-0">
    <Loader v-if="!records" />
    <router-link v-for="record in records" v-bind:key="record.id" :to="`/chart/${record.chart}`" class="group card relative image-full bg-base-100 shadow-xl illustration interactive-card aspect-[4/1] lg:aspect-[8/3] min-h-0 min-w-0">
      <figure v-if="record?.chartDetail"><img class="w-full" :src="fileToURL(record?.chartDetail?.illustration) + '.thumbnail'" /></figure>
      <div class="card-body flex flex-row items-center justify-start p-4 gap-0 group min-h-0 min-w-0">
        <p class="font-tektur text-7xl text-center flex-none mx-2 w-12" :class="{ '-mt-4': record.score >= 1000000, 'drop-shadow-[0_0_4px_#1e7fff]': 960000 <= record.score && record.score < 1000000 && record.full_combo, 'drop-shadow-[0_0_4px_#fffc14]': record.score >= 1000000 }">
          <span v-if="record.score < 700000">F</span>
          <span v-else-if="record.score < 820000">C</span>
          <span v-else-if="record.score < 880000">B</span>
          <span v-else-if="record.score < 920000">A</span>
          <span v-else-if="record.score < 960000">S</span>
          <span v-else-if="record.score < 1000000" :class="{ 'text-[#1e7fff]': record.full_combo }">V</span>
          <span v-else class="text-[#fffc14] -ml-1">φ</span>
        </p>
        <div class="grow min-w-0">
          <p class="group-hover:link truncate w-auto">{{ record?.chartDetail?.name }}</p>
          <p class="font-mono font-black text-3xl">{{ String(record.score).padStart(7, '0') }}</p>
        </div>
      </div>
    </router-link>
  </div>
</template>
