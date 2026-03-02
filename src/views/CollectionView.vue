<i18n>
en:
  title: Collection
  owner: Owner
  charts: Charts
  chart-count: Chart Count
  description-empty: This collection does not have a description.
  no-charts: This collection does not include any charts.
  visibility:
    title: Visibility
    public: Public
    private: Private
  created-at: Created at
  updated-at: Updated at

zh-CN:
  title: 合集
  owner: 创建者
  charts: 谱面
  chart-count: 谱面数量
  description-empty: 该合集没有简介。
  no-charts: 该合集没有收录谱面。
  visibility:
    title: 可见性
    public: 公开
    private: 私有
  created-at: 创建于
  updated-at: 更新于
</i18n>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { detailedTime, setTitle, useFetchApi } from '../common';
import type { Chart } from '../model';

import CoverBackdrop from '../components/CoverBackdrop.vue';
import ChartCard from '../components/ChartCard.vue';
import PropItem from '../components/PropItem.vue';
import SimpleUserCard from '../components/SimpleUserCard.vue';

type Collection = {
  id: number;
  owner: number;
  name: string;
  description: string | null;
  created: string;
  updated: string;
  cover: string | null;
  public: boolean;
  charts: Chart[];
};

const route = useRoute();
const fetchApi = useFetchApi();

const id = parseInt(String(route.params.id));
const collection = (await fetchApi(`/collection/${id}`)) as Collection;

setTitle(collection.name);

const hasCover = computed(() => Boolean(collection.cover));

const description = computed(() => {
  const text = (collection.description ?? '').trim();
  return text.length ? text : t('description-empty');
});

const visibilityLabel = computed(() => (collection.public ? t('visibility.public') : t('visibility.private')));
</script>

<template>
  <div class="relative">
    <CoverBackdrop
      :image="collection.cover"
      backdropClass="-mt-24 h-screen bg-fixed bg-blend-overlay bg-[#bbbbbb] dark:bg-[#000000bb]"
      fadeHeightClass="h-48 -mt-48"
      :backdropStyle="{ transition: 'background-color 0.5s' }" />
    <div class="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-8" :class="hasCover ? '-mt-[35vh]' : 'pt-6'">
      <div class="flex flex-wrap items-center gap-3">
        <h1 class="text-4xl font-black text-base-content">{{ collection.name }}</h1>
        <div class="badge badge-outline">
          {{ visibilityLabel }}
        </div>
      </div>
      <p class="max-w-3xl whitespace-pre-line break-words text-base-content/70">{{ description }}</p>
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="flex flex-col gap-4">
          <div>
            <h2 class="mb-2 text-sm font-semibold uppercase tracking-widest text-base-content/70" v-t="'owner'"></h2>
            <SimpleUserCard :id="collection.owner" class="rounded-xl shadow-xl" />
          </div>
          <div class="card bg-base-100 p-4 shadow-xl">
            <div class="flex flex-col gap-2">
              <PropItem :title="t('created-at')" :value="detailedTime(collection.created)" multi />
              <PropItem :title="t('updated-at')" :value="detailedTime(collection.updated)" multi />
              <PropItem :title="t('visibility.title')" :value="visibilityLabel" multi />
              <PropItem :title="t('chart-count')" :value="String(collection.charts.length)" multi />
            </div>
          </div>
        </div>
        <div class="card bg-base-100 p-4 shadow-xl lg:col-span-2">
          <div v-if="collection.charts.length" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <ChartCard v-for="chart in collection.charts" :key="chart.id" :chart="chart" />
          </div>
          <div v-else class="p-8 text-center">
            <p class="w-full italic" v-t="'no-charts'"></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
