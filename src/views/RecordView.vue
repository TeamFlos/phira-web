<i18n>
en:
  title: Record details
  chart: Chart
  player: Player
  back-to-leaderboard: Back to leaderboard
  charts: Browse charts
  judgments: Judgments
  play-info: Play information
  no-data: No data
  no-mods: None
  full-combo: Full combo
  all-perfect: All Perfect
  loading: Loading record
  retry: Try again
  not-found: This record does not exist, or you cannot view it.
  forbidden: You do not have permission to view this record.
  load-error: Failed to load this record. Please try again.
  fields:
    score: Score
    accuracy: Accuracy
    perfect: Perfect
    good: Good
    bad: Bad
    miss: Miss
    speed: Speed
    max_combo: Max combo
    best: Personal best score
    best_std: Personal best purity
    mods: Mods
    time: Played at
    std: Timing standard deviation
    std_score: Purity

zh-CN:
  title: 成绩详情
  chart: 谱面
  player: 玩家
  back-to-leaderboard: 返回排行榜
  charts: 浏览谱面
  judgments: 判定统计
  play-info: 游玩信息
  no-data: 无数据
  no-mods: 无
  full-combo: 全连
  all-perfect: 全 Perfect
  loading: 正在加载成绩
  retry: 重试
  not-found: 该成绩不存在，或你无权查看。
  forbidden: 你无权查看该成绩。
  load-error: 成绩加载失败，请重试。
  fields:
    score: 分数
    accuracy: 准度
    perfect: Perfect
    good: Good
    bad: Bad
    miss: Miss
    speed: 游玩速度
    max_combo: 最大连击
    best: 个人最佳分数
    best_std: 个人最佳无瑕度
    mods: Mods
    time: 游玩时间
    std: 判定标准差
    std_score: 无瑕度
</i18n>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import moment from 'moment';

import { fileToURL, setTitle, userNameClass } from '../common';
import { useApi } from '../api/client';
import type { Chart, PlayRecord, UserView } from '../model';

import LoadView from '../components/LoadView.vue';
import PropItem from '../components/PropItem.vue';
import UserAvatar from '../components/UserAvatar.vue';
import UserBadges from '../components/UserBadges.vue';

const { t, locale } = useI18n();
const route = useRoute();
const api = useApi();
const recordCode = computed(() => String(route.params.record_code ?? ''));
const record = ref<PlayRecord>();
const chart = ref<Chart>();
const player = ref<UserView>();
const loading = ref(true);
const errorMessage = ref<'not-found' | 'forbidden' | 'load-error'>();
let loadId = 0;
onBeforeUnmount(() => loadId++);

const isAllPerfect = computed(() => record.value?.accuracy === 1);
const judgments = [
  { key: 'perfect', color: 'border-amber-400/40 bg-amber-400/10' },
  { key: 'good', color: 'border-sky-400/40 bg-sky-400/10' },
  { key: 'bad', color: 'border-red-400/40 bg-red-400/10' },
  { key: 'miss', color: 'border-gray-400/40 bg-gray-400/10' },
] as const;

const playedAt = computed(() => {
  if (!record.value) return '';
  const date = new Date(record.value.time);
  if (Number.isNaN(date.getTime())) return t('no-data');
  // Omitting timeZone uses the user's current browser time zone.
  return new Intl.DateTimeFormat(locale.value, { dateStyle: 'long', timeStyle: 'medium' }).format(date);
});

const timingDeviation = computed(() => {
  const std = record.value?.std;
  if (std === null || std === undefined) return t('no-data');
  return `${new Intl.NumberFormat(locale.value, { maximumFractionDigits: 2 }).format(std * 1000)} ms`;
});

async function load() {
  const requestId = ++loadId;
  loading.value = true;
  errorMessage.value = undefined;
  record.value = undefined;
  chart.value = undefined;
  player.value = undefined;

  const id = Number(recordCode.value);
  if (!/^\d+$/.test(recordCode.value) || !Number.isSafeInteger(id) || id < 1 || id > 2147483647) {
    errorMessage.value = 'not-found';
    loading.value = false;
    return;
  }

  try {
    const { data, error, response } = await api.GET('/record/{id}', { params: { path: { id } } });
    const status = response.status;
    if (requestId !== loadId) return;
    loading.value = false;
    if (error || !data) {
      errorMessage.value = status === 404 ? 'not-found' : status === 401 || status === 403 ? 'forbidden' : 'load-error';
      return;
    }
    record.value = data;
    setTitle(t('title'));

    // Related metadata is optional: the record remains readable if either request fails.
    const [chartResult, playerResult] = await Promise.allSettled([
      api.GET('/chart/{id}', { params: { path: { id: data.chart } } }),
      api.GET('/user/{id}', { params: { path: { id: data.player } } }),
    ]);
    if (requestId !== loadId) return;
    if (chartResult.status === 'fulfilled' && chartResult.value.data) chart.value = chartResult.value.data;
    if (playerResult.status === 'fulfilled' && playerResult.value.data) player.value = playerResult.value.data;
  } catch {
    if (requestId !== loadId) return;
    loading.value = false;
    errorMessage.value = 'load-error';
  }
}

watch(recordCode, load, { immediate: true });
</script>

<template>
  <div class="flex flex-col items-center px-4 lg:px-0 mb-24">
    <div class="w-full lg:w-3/4 flex flex-col gap-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-3xl font-black">{{ t('title') }}</h1>
        <router-link v-if="record" :to="{ name: 'chart', params: { id: record.chart }, hash: '#ldb' }" class="btn btn-sm btn-outline">
          <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
          {{ t('back-to-leaderboard') }}
        </router-link>
      </div>

      <div v-if="loading" class="card bg-base-100 shadow-xl p-12 items-center" role="status" :aria-label="t('loading')">
        <LoadView />
      </div>
      <div v-else-if="errorMessage" class="card bg-base-100 shadow-xl p-8 items-center gap-4 text-center" role="alert">
        <p class="opacity-70">{{ t(errorMessage) }}</p>
        <div class="flex flex-wrap justify-center gap-2">
          <button class="btn btn-primary btn-sm" @click="load">{{ t('retry') }}</button>
          <router-link to="/chart" class="btn btn-sm btn-outline">{{ t('charts') }}</router-link>
        </div>
      </div>

      <template v-else-if="record">
        <section class="card bg-base-100 shadow-xl">
          <div class="card-body gap-6 p-4 sm:p-6">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <router-link :to="`/chart/${record.chart}`" class="group flex items-center gap-4 min-w-0">
                <img v-if="chart" :src="fileToURL(chart.illustration) + '.thumbnail'" alt="" class="w-24 sm:w-32 aspect-[8/5] object-cover rounded-lg shrink-0" />
                <div class="min-w-0">
                  <p v-if="chart" class="text-sm opacity-60">{{ chart.composer }}</p>
                  <h2 class="text-xl sm:text-2xl font-bold group-hover:link break-words">{{ chart?.name ?? t('chart') }}</h2>
                  <span v-if="chart" class="badge badge-primary mt-2">{{ chart.level }}</span>
                </div>
              </router-link>
              <span
                v-if="isAllPerfect || record.full_combo"
                class="badge badge-lg font-bold"
                :class="isAllPerfect ? 'bg-amber-200 border-amber-300 text-amber-900' : 'bg-sky-100 border-sky-200 text-sky-800'"
                :title="t(isAllPerfect ? 'all-perfect' : 'full-combo')">
                {{ isAllPerfect ? 'AP' : 'FC' }}
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div class="rounded-box bg-base-200 p-4 min-w-0 flex flex-col justify-center items-start">
                <p class="text-sm opacity-60">{{ t('fields.score') }}</p>
                <p class="font-mono font-black text-4xl sm:text-3xl xl:text-4xl mt-1">{{ String(record.score).padStart(7, '0') }}</p>
                <span v-if="record.best" class="badge badge-primary badge-outline mt-3">{{ t('fields.best') }}</span>
              </div>
              <div class="rounded-box bg-base-200 p-4 min-w-0 flex flex-col justify-center items-start">
                <p class="text-sm opacity-60">{{ t('fields.std_score') }}</p>
                <p class="font-mono font-black text-4xl sm:text-3xl xl:text-4xl mt-1">{{ record.std_score == null ? t('no-data') : Math.floor(record.std_score) }}</p>
                <span v-if="record.best_std" class="badge badge-primary badge-outline mt-3">{{ t('fields.best_std') }}</span>
              </div>
              <div class="rounded-box bg-base-200 p-4 min-w-0 flex flex-col justify-center items-start">
                <p class="text-sm opacity-60">{{ t('fields.accuracy') }}</p>
                <p class="font-mono font-black text-4xl sm:text-3xl xl:text-4xl mt-1">{{ (record.accuracy * 100).toFixed(2) }}%</p>
              </div>
              <div class="rounded-box bg-base-200 p-4 min-w-0 flex flex-col justify-center items-start">
                <p class="text-sm opacity-60">{{ t('fields.max_combo') }}</p>
                <p class="font-mono font-black text-4xl sm:text-3xl xl:text-4xl mt-1">{{ record.max_combo }}</p>
              </div>
            </div>
          </div>
        </section>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <section class="card bg-base-100 shadow-xl p-4 sm:p-6 gap-4 h-fit">
            <router-link :to="`/user/${record.player}`" class="group flex items-center gap-3 min-w-0">
              <div class="avatar shrink-0">
                <div class="w-12 mask mask-squircle"><UserAvatar :url="player?.avatar ?? undefined" /></div>
              </div>
              <div class="min-w-0">
                <p class="font-bold text-xl group-hover:link break-words" :class="player ? userNameClass(player.badges) : ''">
                  {{ player?.name ?? t('player') }}
                </p>
              </div>
            </router-link>
            <UserBadges v-if="player" :badges="player.badges" :names="player.badgeNames" sm />
            <div class="border-t border-base-300 pt-4 flex flex-col gap-3">
              <div>
                <p class="text-sm opacity-60 mb-1">{{ t('fields.time') }}</p>
                <time :datetime="record.time" class="text-sm break-words">{{ playedAt }}</time>
                <p class="text-xs opacity-60 mt-1">{{ moment(record.time).fromNow() }}</p>
              </div>
            </div>
          </section>

          <div class="lg:col-span-2 flex flex-col gap-4 min-w-0">
            <section class="card bg-base-100 shadow-xl p-4 sm:p-6 gap-4">
              <h2 class="text-xl font-bold">{{ t('judgments') }}</h2>
              <dl class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div v-for="judgment in judgments" :key="judgment.key" class="rounded-box border p-4" :class="judgment.color">
                  <dt class="text-sm opacity-60">{{ t(`fields.${judgment.key}`) }}</dt>
                  <dd class="font-mono font-bold text-2xl mt-1">{{ record[judgment.key] }}</dd>
                </div>
              </dl>
            </section>

            <section class="card bg-base-100 shadow-xl p-4 sm:p-6 gap-4">
              <h2 class="text-xl font-bold">{{ t('play-info') }}</h2>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <PropItem :title="t('fields.speed')" :value="`${record.speed}×`" multi />
                <PropItem :title="t('fields.mods')" :value="record.mods === 0 ? t('no-mods') : String(record.mods)" multi />
                <PropItem :title="t('fields.std')" :value="timingDeviation" multi />
              </div>
            </section>
          </div>
        </div>

      </template>
    </div>
  </div>
</template>
