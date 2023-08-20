<i18n>
en:
  composer: Composer
  illustrator: Illustrator
  charter: Charter
  difficulty: Difficulty

  updated-at: Updated at
  created-at: Created at

  leaderboard: Leaderboard
  stb-history: Stb. History

  description-empty: This chart doesn't have description.

  set-ranked: Set ranked
  set-special: Set special
  div-updated: Division updated

  status:
    title: Status
    unreviewed: Unreviewed
    reviewed: Reviewed
    stable: Stable

  rating:
    title: Rating
    title-with-mine: Rating ({score})
    detail: '{score} / 5.00, {count} votes'
    done: Rated

zh-CN:
  composer: 曲师
  illustrator: 画师
  charter: 谱师
  difficulty: 难度

  updated-at: 更新于
  created-at: 上传于

  leaderboard: 排行榜
  stb-history: 评议记录

  description-empty: 该谱面没有简介。

  set-ranked: 设置为常规
  set-special: 设置为特殊
  div-updated: 分区已更新

  status:
    title: 状态
    unreviewed: 未审核
    reviewed: 未上架
    stable: 已上架

  rating:
    title: 评分
    title-with-mine: 评分（{score}）
    detail: '{score} / 5.00，{count} 人投票'
    done: 投票成功

</i18n>

<script setup lang="ts">
import { ref, watch, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import moment from 'moment';

import { useFetchApi, fileToURL, toast, toastError, loggedIn, setTitle } from './common';
import { Permission, Roles, type Chart, type User } from './model';

import LeaderboardView from './components/LeaderboardView.vue';
import LoadOr from './components/LoadOr.vue';
import LoadSuspense from './components/LoadSuspense.vue';
import PropItem from './components/PropItem.vue';
import RatingBar from './components/RatingBar.vue';
import StbStatus from './components/StbStatus.vue';
import TagList from './components/TagList.vue';
import UserCard from './components/UserCard.vue';

const fetchApi = useFetchApi();

const route = useRoute();
const router = useRouter();

const id = parseInt(String(route.params.id));
const chart = reactive((await fetchApi(`/chart/${id}`)) as Chart);
const tags = [];
for (let tag of chart.tags) {
  if (!['regular', 'troll', 'plain', 'visual'].includes(tag)) tags.push(tag);
}

setTitle(chart.name);

const me = ref<User>();
if (loggedIn()) {
  fetchApi('/me', {}, (user) => (me.value = user as User));
}

const chartRating = ref<typeof RatingBar>();
const rating = ref<number>();

onMounted(() => {
  watch(
    () => chartRating.value?.selected,
    (r) => (rating.value = r),
  );
});

const contentTab = ref('ldb');
watch(
  () => route.hash,
  (hash) => {
    if (hash === '#ldb') contentTab.value = 'ldb';
    else if (hash === '#stb') contentTab.value = 'stb';
  },
  { immediate: true },
);

function switchTab(s: string) {
  router.replace({ path: route.path, hash: '#' + s });
}

const myRating = ref<number>();
if (loggedIn()) {
  fetchApi(`/chart/${id}/rate`, {}, (r) => (myRating.value = (r as { score: number }).score));
}

const settingRanked = ref(false);
async function setRanked(ranked: boolean) {
  if (settingRanked.value) return;
  settingRanked.value = true;
  try {
    await fetchApi(`/chart/${id}/set-ranked`, {
      method: 'POST',
      json: { ranked },
    });
    toast(t('div-updated'));
    chart.ranked = ranked;
  } catch (e) {
    toastError(e);
  } finally {
    settingRanked.value = false;
  }
}

const submittingRating = ref(false);
async function submitRating() {
  if (submittingRating.value) return;
  submittingRating.value = true;
  try {
    await fetchApi(`/chart/${id}/rate`, {
      method: 'POST',
      json: { score: rating.value! },
    });
    myRating.value = rating.value!;
    toast(t('rating.done'));
  } catch (e) {
    toastError(e);
  } finally {
    submittingRating.value = false;
  }
}
</script>

<template>
  <div class="relative">
    <div
      :style="{
        'background-image': 'url(' + fileToURL(chart.illustration) + ')',
      }"
      class="-mt-24 illustration w-full h-screen bg-fixed bg-blend-overlay bg-[#bbbbbb] dark:bg-[#000000bb]"
      style="transition: background-color 0.5s"></div>
    <div class="w-full h-48 -mt-48 bg-gradient-to-b from-transparent to-base-200"></div>
    <div class="flex flex-col items-center -mt-[35vh] mb-24">
      <div class="px-8 w-full lg:px-0 lg:w-3/4 gap-8">
        <div class="flex flex-col">
          <h1>{{ chart.composer }}</h1>
          <h1 class="text-5xl font-black">{{ chart.name }}</h1>
          <div class="mt-16 flex flex-col lg:flex-row-reverse gap-8">
            <div class="flex flex-col lg:w-1/4 gap-4">
              <UserCard :id="chart.uploader">
                <div class="divider"></div>
                <div class="flex flex-col w-full gap-2">
                  <PropItem :title="t('composer')" :value="chart.composer" />
                  <PropItem :title="t('illustrator')" :value="chart.illustrator" />
                  <PropItem :title="t('charter')" :value="chart.charter" />
                  <PropItem :title="t('difficulty')" :value="`${chart.level} (${chart.difficulty.toFixed(1)})`" />
                </div>
                <div class="divider"></div>
                <div class="flex flex-col w-full gap-2">
                  <PropItem :title="t('status.title')" :value="t(chart.reviewed ? (chart.stable ? 'status.stable' : 'status.reviewed') : 'status.unreviewed')" />
                  <PropItem :title="t('updated-at')" :value="moment(chart.updated).fromNow()" />
                  <PropItem :title="t('created-at')" :value="moment(chart.created).fromNow()" />
                </div>
                <div class="divider"></div>
                <p v-if="chart.description.length" class="w-full break-words">
                  {{ chart.description }}
                </p>
                <p v-else class="w-full italic" v-t="'description-empty'"></p>
                <template v-if="tags.length">
                  <div class="divider"></div>
                  <TagList class="w-full" :canEdit="false" :init="tags" />
                </template>
              </UserCard>
              <div v-if="me && Roles.from(me.roles).permissions(me.banned).has(Permission.SET_RANKED) && chart.stable" class="card shadow-xl">
                <button v-if="chart.ranked" class="btn btn-neutral btn-active w-full" @click="setRanked(false)">
                  <LoadOr :loading="settingRanked">{{ t('set-special') }}</LoadOr>
                </button>
                <button v-else class="btn btn-accent w-full" @click="setRanked(true)">
                  <LoadOr :loading="settingRanked">{{ t('set-ranked') }}</LoadOr>
                </button>
              </div>
              <div class="card bg-base-100 shadow-xl flex flex-col items-center p-4 gap-2 mb-12">
                <p v-if="!myRating" class="text-center">
                  {{ t('rating.title') }}
                </p>
                <p v-else class="text-center">
                  {{
                    t('rating.title-with-mine', {
                      score: (myRating / 2).toFixed(1),
                    })
                  }}
                </p>
                <p class="text-center text-sm">
                  {{
                    t('rating.detail', {
                      score: ((chart.rating ? chart.rating : 0) * 5).toFixed(2),
                      count: chart.ratingCount,
                    })
                  }}
                </p>
                <RatingBar name="chart-rating" :init="Math.round((chart.rating ?? 0) * 10)" ref="chartRating" />
                <button v-if="rating" class="btn btn-primary mt-2" @click="submitRating">
                  <LoadOr :loading="submittingRating">{{ t('submit') }}</LoadOr>
                </button>
              </div>
            </div>
            <div class="grow -mt-8 lg:w-3/4">
              <div class="tabs">
                <a class="tab tab-lifted text-base-content" :class="{ 'tab-active': contentTab === 'ldb' }" @click="switchTab('ldb')" v-t="'leaderboard'"></a>
                <a class="tab tab-lifted text-base-content" :class="{ 'tab-active': contentTab === 'stb' }" @click="switchTab('stb')" v-t="'stb-history'"></a>
              </div>
              <div class="card bg-base-100 shadow-xl p-4 rounded-t-none">
                <LoadSuspense v-if="contentTab === 'ldb'">
                  <LeaderboardView :chart="chart.id" />
                </LoadSuspense>
                <LoadSuspense v-if="contentTab === 'stb'">
                  <StbStatus :chart="chart.id" :uploader="chart.uploader" />
                </LoadSuspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
