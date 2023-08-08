<script setup lang="ts">

import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import moment from 'moment'

import { useFetchApi, fileToURL } from './common'
import type { Chart, User } from './model'

import Leaderboard from './components/Leaderboard.vue'
import Loader from './components/Loader.vue'
import Property from './components/Property.vue'
import Rating from './components/Rating.vue'
import StbHistory from './components/StbHistory.vue'
import UserCard from './components/UserCard.vue'

const fetchApi = useFetchApi();

const route = useRoute();
const router = useRouter();

const id = parseInt(String(route.params.id));
const chart = await fetchApi(`/chart/${id}`) as Chart;

const chartRating = ref<typeof Rating>();
const rating = ref<number>();

onMounted(() => {
  watch(() => chartRating.value?.selected, (r) => rating.value = r);
});

const contentTab = ref('ldb');
watch(
  () => route.hash,
  (hash) => {
    if (hash === '#ldb') contentTab.value = 'ldb';
    else if (hash === '#stb') contentTab.value = 'stb';
  },
  { immediate: true }
);

function switchTab(s: string) {
  router.replace({ path: route.path, hash: '#' + s });
}

</script>

<template>
  <div class="relative">
    <div :style="{'background-image': 'url(' + fileToURL(chart.illustration) + ')'}" class="-mt-24 illustration w-full h-screen bg-fixed bg-blend-multiply bg-[#444444]"></div>
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
                  <Property title="曲师" :value="chart.composer" />
                  <Property title="画师" :value="chart.illustrator" />
                  <Property title="谱师" :value="chart.charter" />
                  <Property title="难度" :value="`${chart.level} (${chart.difficulty.toFixed(1)})`" />
                </div>
                <div class="divider"></div>
                <div class="flex flex-col w-full gap-2">
                  <Property title="更新于" :value="moment(chart.updated).fromNow()" />
                  <Property title="上传于" :value="moment(chart.created).fromNow()" />
                </div>
                <div class="divider"></div>
                <p v-if="chart.description.length" class="w-full">{{ chart.description }}</p>
                <p v-else class="w-full italic">该谱面没有简介。</p>
              </UserCard>
              <div class="card bg-base-100 shadow-xl flex flex-col items-center p-4 gap-2 mb-12">
                <p>评分</p>
                <Rating name="chart-rating" :init="(chart.rating ?? 0) * 10" ref="chartRating" />
                <button v-if="rating" class="btn btn-primary mt-2">提交评分</button>
              </div>
            </div>
            <div class="grow -mt-8 lg:w-3/4">
              <div class="tabs">
                <a class="tab tab-lifted" :class="{ 'tab-active': contentTab === 'ldb' }" @click="switchTab('ldb')">排行榜</a>
                <a class="tab tab-lifted" :class="{ 'tab-active': contentTab === 'stb' }" @click="switchTab('stb')">评议记录</a>
              </div>
              <div class="card bg-base-100 shadow-xl p-4 rounded-t-none">
                <Leaderboard v-if="contentTab === 'ldb'" :chart="chart.id" />
                <Suspense v-if="contentTab === 'stb'" timeout="0">
                  <template #default>
                    <StbHistory :chart="chart.id" :uploader="chart.uploader" />
                  </template>
                  <template #fallback>
                    <div class="flex justify-center my-2">
                      <Loader/>
                    </div>
                  </template>
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
