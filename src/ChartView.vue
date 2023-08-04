<script setup lang="ts">

import { ref, h } from 'vue'
import { useRoute } from 'vue-router'

import moment from 'moment'

import { useFetchApi, fileToURL } from './common'
import type { Chart, User } from './model'

import Leaderboard from './components/Leaderboard.vue'
import Rating from './components/Rating.vue'
import UserCard from './components/UserCard.vue'

const fetchApi = useFetchApi();

const route = useRoute();

const id = parseInt(String(route.params.id));
const chart = await fetchApi(`/chart/${id}`) as Chart;

const rating = ref<number>();

function Property(
  props: { title: string, value: string }
) {
  return h(
    'div',
    { 'class': 'flex flex-row text-lg' },
    [
      h('span', { 'class': 'grow' }, props.title),
      h('span', { 'class': 'text-primary-content' }, props.value),
    ]
  );
}

</script>

<template>
  <div class="relative">
    <div :style="{'background-image': 'url(' + fileToURL(chart.illustration) + ')'}" class="-mt-24 illustration w-full h-screen bg-fixed bg-blend-multiply bg-[#444444]">
    </div>
    <div class="w-full h-48 -mt-48 bg-gradient-to-b from-transparent to-base-200"></div>
    <div class="flex flex-col items-center -mt-[35vh]">
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
                <p v-if="!chart.description.length" class="w-full italic">该谱面没有简介。</p>
              </UserCard>
              <div class="card bg-base-100 shadow-xl flex flex-col items-center p-4 gap-2">
                <p>评分</p>
                <Rating :init="chart.rating * 5" @change="(index) => { rating = index }" />
                <button v-if="rating" class="btn btn-primary mt-2">提交评分</button>
              </div>
            </div>
            <div class="grow -mt-8 lg:w-3/4">
              <div class="tabs">
                <a class="tab tab-lifted tab-active">排行榜</a>
                <a class="tab tab-lifted">评议记录</a>
              </div>
              <div class="card bg-base-100 shadow-xl p-4 rounded-s-none">
                <Leaderboard :chart="chart.id" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>