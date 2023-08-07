<script setup lang="ts">

import { ref, computed, watch, onMounted } from 'vue'

import { useFetchApi, fileToURL, pageCount, userNameClass } from '../common'
import type { Page, Record } from '../model'

const PAGE_NUM = 20;

import Loader from './Loader.vue'
import Pagination from './Pagination.vue'

import moment from 'moment'

const props = defineProps<{ chart: number }>();

const fetchApi = useFetchApi();

const pagination = ref<typeof Pagination>();

type RecordEx = Record & {
  rank?: number,
  playerName: string,
  playerAvatar?: string,
  playerBadges: string[],
};

const totalCount = ref(0);
const records = ref<RecordEx[]>();

const parameters = computed(() => {
  return {
    page: String(pagination.value?.current ?? 1),
  };
});

async function fetchRecords() {
  records.value = undefined;
  let params = {
    chart: String(props.chart),
    pageNum: String(PAGE_NUM),
    includePlayer: String(true),
    best: String(true),
    ...parameters.value
  };
  const resp = await fetchApi('/record/query?' + new URLSearchParams(params)) as Page<RecordEx>;
  totalCount.value = resp.count;
  for (let i = 0; i < resp.results.length; ++i) {
    resp.results[i].rank = ((pagination.value?.current ?? 1) - 1) * PAGE_NUM + i + 1;
  }
  records.value = resp.results;
}

await fetchRecords();

onMounted(() => {
  watch(parameters, fetchRecords);
});

</script>

<template>
  <div class="overflow-x-auto flex flex-col items-end gap-2">
    <div class="overflow-x-auto w-full">
      <table class="table">
        <thead>
          <tr>
            <th>排名</th>
            <th>玩家</th>
            <th>分数</th>
            <th>无瑕度</th>
            <th>准度</th>
            <th>Perfect</th>
            <th>Good</th>
            <th>Bad</th>
            <th>Miss</th>
            <th>时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in records" :key="record.id" class="hover text-lg">
            <th class="text-center">
              <i v-if="record.rank === 1" class="fa-solid fa-trophy text-[#ffd700]"></i>
              <i v-if="record.rank === 2" class="fa-solid fa-trophy text-[#c0c0c0]"></i>
              <i v-if="record.rank === 3" class="fa-solid fa-trophy text-[#cd7f32]"></i>
              {{ record.rank }}
            </th>
            <td>
              <router-link :to="`/user/${record.player}`" class="flex flex-row items-center gap-2 group">
                <div class="avatar">
                  <div class="w-8 rounded-xl">
                    <img v-if="record.playerAvatar" :src="fileToURL(record.playerAvatar)" />
                    <img v-if="!record.playerAvatar" src="../assets/user.png" />
                  </div>
                </div>
                <span :class="[userNameClass(record.playerBadges)]" class="group-hover:link">{{ record.playerName }}</span>
              </router-link>
            </td>
            <td class="font-black font-mono text-2xl">{{ record.score }}</td>
            <td class="font-black font-mono text-2xl">{{ Math.floor(record.std_score) }}</td>
            <td>{{ (record.accuracy * 100).toFixed(2) + '%' }}</td>
            <td>{{ record.perfect }}</td>
            <td>{{ record.good }}</td>
            <td>{{ record.bad }}</td>
            <td>{{ record.miss }}</td>
            <td class="whitespace-nowrap">{{ moment(record.time).fromNow() }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="!records" class="w-full flex flex-row justify-center my-4">
        <Loader />
      </div>
    </div>
    <Pagination :total="pageCount(totalCount, PAGE_NUM)" ref="pagination" />
  </div>
</template>
