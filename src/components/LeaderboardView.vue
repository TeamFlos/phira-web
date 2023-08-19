<i18n>
en:
  rank: Rank
  player: Player
  score: Score
  purity: Purity
  accuracy: Accuracy
  perfect: Perfect
  good: Good
  bad: Bad
  miss: Miss
  time: Time
  no-std: NaN

zh-CN:
  rank: 排名
  player: 玩家
  score: 分数
  purity: 无瑕度
  accuracy: 准度
  perfect: Perfect
  good: Good
  bad: Bad
  miss: Miss
  time: 时间
  no-std: 无数据

</i18n>

<script setup lang="ts">

import { ref, computed, watch, onMounted } from 'vue'

import { useI18n } from 'vue-i18n'
const { t } = useI18n();

import { useFetchApi, pageCount, userNameClass } from '../common'
import type { Page, PlayRecord } from '../model'

const PAGE_NUM = 20;

import LoadView from './LoadView.vue'
import PageIndicator from './PageIndicator.vue'
import UserAvatar from './UserAvatar.vue'

import moment from 'moment'

const props = defineProps<{ chart: number }>();

const fetchApi = useFetchApi();

const pagination = ref<typeof PageIndicator>();

type RecordEx = PlayRecord & {
  rank?: number,
  playerName: string,
  playerAvatar?: string,
  playerBadges: string[],
};

const std = ref(false);
watch(std, () => pagination.value!.current = 1);

const totalCount = ref(0);
const records = ref<RecordEx[]>();

const parameters = computed(() => {
  return {
    page: String(pagination.value?.current ?? 1),
    std: String(std.value),
  };
});

async function fetchRecords() {
  records.value = undefined;
  let params = {
    pageNum: String(PAGE_NUM),
    includePlayer: String(true),
    best: String(true),
    ...parameters.value
  };
  const resp = await fetchApi('/record/query/' + props.chart + '?' + new URLSearchParams(params)) as Page<RecordEx>;
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
  <div class="flex flex-col">
    <div class="flex flex-row justify-end gap-3">
      <!-- <span>分数</span> -->
      <!-- <input type="checkbox" class="toggle" checked /> -->
      <!-- <span>无瑕度</span> -->
      <button class="btn btn-ghost" @click="std = !std"><i class="fa-solid fa-repeat"></i>{{ std? t('purity'): t('score') }}</button>
    </div>
    <div class="overflow-x-auto flex flex-col items-end gap-2 mt-2">
      <div class="overflow-x-auto w-full">
        <table class="table">
          <thead>
            <tr>
              <th v-t="'rank'"></th>
              <th v-t="'player'"></th>
              <th v-if="!std" v-t="'score'"></th>
              <th v-t="'purity'"></th>
              <th v-if="std" v-t="'score'"></th>
              <th v-t="'accuracy'"></th>
              <th v-t="'perfect'"></th>
              <th v-t="'good'"></th>
              <th v-t="'bad'"></th>
              <th v-t="'miss'"></th>
              <th v-t="'time'"></th>
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
                      <UserAvatar :url="record.playerAvatar" />
                    </div>
                  </div>
                  <span :class="[userNameClass(record.playerBadges)]" class="group-hover:link">{{ record.playerName }}</span>
                </router-link>
              </td>
              <td v-if="!std" class="font-black font-mono text-2xl">{{ record.score }}</td>
              <td v-if="record.std_score" class="font-black font-mono text-2xl">{{ Math.floor(record.std_score) }}</td>
              <td v-else class="text-xl" v-t="'no-std'"></td>
              <td v-if="std" class="font-black font-mono text-2xl">{{ record.score }}</td>
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
          <LoadView />
        </div>
      </div>
      <PageIndicator :total="pageCount(totalCount, PAGE_NUM)" ref="pagination" />
    </div>
  </div>
</template>
