<script setup lang="ts">
import { ref, reactive, watch } from 'vue';

import { useFetchApi, fileToURL } from '../common';
import type { Chart, PlayRecord } from '../model';

import LoadView from './LoadView.vue';

const props = defineProps<{
  params?: Record<string, string>;
  limit?: number;
}>();

const fetchApi = useFetchApi();

type PlayRecordEx = PlayRecord & { chartDetail?: Chart };

const records = ref<ReturnType<typeof reactive<PlayRecordEx>>[]>();

async function fetchRecords() {
  records.value = undefined;
  let resp = (await fetchApi('/record?' + new URLSearchParams(props.params ?? {}))) as PlayRecordEx[];
  if (props.limit && resp.length > props.limit) {
    resp.splice(props.limit);
  }
  let transformed = [];
  for (let record of resp) {
    let r = reactive(record);
    fetchApi(`/chart/${record.chart}`, {}, (chart) => {
      r.chartDetail = chart as Chart;
    });
    transformed.push(r);
  }
  records.value = transformed;
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
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-0 min-w-0">
    <LoadView v-if="!records" />
    <router-link
      v-for="record in records"
      :key="record.id"
      :to="`/chart/${record.chart}`"
      class="group card relative image-full bg-base-100 shadow-xl illustration interactive-card aspect-[4/1] lg:aspect-[8/3] min-h-0 min-w-0">
      <figure v-if="record?.chartDetail">
        <img class="w-full aspect-[4/1] lg:aspect-[8/3]" :src="fileToURL(record?.chartDetail?.illustration) + '.thumbnail'" />
      </figure>
      <div class="card-body flex flex-row items-center justify-start p-4 gap-0 group aspect-[4/1] lg:aspect-[8/3] min-h-0 min-w-0">
        <img :src="getRankIcon(record)" class="h-10 xl:h-16 mr-2" />
        <div class="grow min-w-0">
          <p class="group-hover:link truncate w-auto">
            {{ record?.chartDetail?.name }}
          </p>
          <p class="font-mono font-black text-3xl">
            {{ String(record.score).padStart(7, '0') }}
          </p>
        </div>
      </div>
    </router-link>
  </div>
</template>
