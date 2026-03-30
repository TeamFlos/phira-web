<i18n>
en:
  title: Collection
  owner: Owner
  charts: Charts
  chart-count: Chart Count
  description-empty: This collection does not have a description.
  no-charts: This collection does not include any charts.
  report:
    button: Report
    hint: Report reason. 10 to 200 characters.
    done: Reported successfully. Thank you for your contribution to the health of the Phira community!
  import:
    label: Import
    tooltip: Copied to clipboard. Please paste it in "Collections" -> "Import" in-game.
  like:
    label: Like
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
  report:
    button: 举报
    hint: 请填写举报理由，10 - 200 字
    done: 举报成功，感谢你对 Phira 社区健康作出的贡献！
  import:
    label: 导入
    toast: 已复制到剪贴板，请粘贴到游戏内“收藏夹”->“导入”中
  like:
    label: 点赞
  visibility:
    title: 可见性
    public: 公开
    private: 私有
  created-at: 创建于
  updated-at: 更新于
</i18n>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { detailedTime, loggedIn, pleaseLogin, setTitle, toast, useFetchApi, type IConfirmDialog } from '../common';
import type { Collection } from '../model';

import CoverBackdrop from '../components/CoverBackdrop.vue';
import ChartCard from '../components/ChartCard.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import PropItem from '../components/PropItem.vue';
import SimpleUserCard from '../components/SimpleUserCard.vue';
import { useClipboard } from '@vueuse/core';

const route = useRoute();
const router = useRouter();
const fetchApi = useFetchApi();

const id = parseInt(String(route.params.id));
const collection = ref<Collection>();

if (!loggedIn()) {
  pleaseLogin(router);
} else {
  collection.value = (await fetchApi(`/collection/${id}`)) as Collection;
  setTitle(collection.value.name);
}

const hasCover = computed(() => Boolean(collection.value?.cover));

const description = computed(() => {
  const text = (collection.value?.description ?? '').trim();
  return text.length ? text : t('description-empty');
});

const visibilityLabel = computed(() => (collection.value?.public ? t('visibility.public') : t('visibility.private')));

const reportDialog = ref<IConfirmDialog>();
const reportReason = ref('');
async function doReport() {
  await fetchApi(`/collection/${id}/report`, {
    method: 'POST',
    json: {
      reason: reportReason.value!,
    },
  });
  toast(t('report.done'));
}

const { copy } = useClipboard();
function copyUrl() {
  const url = `${window.location.origin}/collection/${id}`;
  copy(url);
  toast(t('import.toast'));
}

const liked = ref<boolean>();
fetchApi(`/collection/${id}/like`, { method: 'GET' }).then((res) => {
  liked.value = (res as { like: boolean }).like;
});
function doLike() {
  if (liked.value === undefined) return;
  fetchApi(`/collection/${id}/like`, {
    method: 'POST',
    json: {
      like: !liked.value,
    },
  }).then((res) => {
    liked.value = !liked.value;
    collection.value!.likes = (res as { likes: number }).likes;
  });
}
</script>

<template>
  <div v-if="collection" class="relative">
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
        <div class="ml-auto flex items-center gap-2">
          <button
            class="btn btn-sm"
            :class="{
              'btn-disabled': liked === undefined,
              'btn-success': liked,
            }"
            @click="doLike">
            <i class="fa-solid fa-thumbs-up mr-1"></i>
            <span class="">{{ collection.likes }}</span>
            {{ t('like.label') }}
          </button>
          <button class="btn btn-sm" @click="copyUrl">
            <i class="fa-solid fa-file-arrow-down mr-1"></i>
            {{ t('import.label') }}
          </button>
          <button
            class="btn btn-error btn-sm"
            @click="
              () => {
                reportReason = '';
                reportDialog!.showModal();
              }
            ">
            <i class="fa-regular fa-flag mr-1"></i>
            {{ t('report.button') }}
          </button>
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
  <ConfirmDialog :do="doReport" ref="reportDialog">
    <h3 class="font-bold text-lg" v-t="'report.button'"></h3>
    <textarea class="textarea textarea-bordered h-32 w-full mt-4" :placeholder="t('report.hint')" v-model="reportReason"></textarea>
  </ConfirmDialog>
</template>
