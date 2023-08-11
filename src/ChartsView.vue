<script setup lang="ts">

import { ref, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useFetchApi, fileToURL, pageCount, isString, getCookie } from './common'

import { Permission, Roles } from './model'
import type { Chart, Page, User } from './model'

import Loader from './components/Loader.vue'
import Pagination from './components/Pagination.vue'
import Rating from './components/Rating.vue'
import Tags from './components/Tags.vue'

const PAGE_NUM = 28;

const route = useRoute();
const router = useRouter();

const fetchApi = useFetchApi();

let user: User | null = null;

if (getCookie('access_token')) {
  user = await fetchApi('/me') as User;
}

const pagination = ref<typeof Pagination>();

const totalCount = ref(0);
const charts = ref<Chart[]>();

let initPage = 1;
const searchValue = ref(''), tempSearchValue = ref<string>();
const division = ref('regular');
const order = ref('-updated');
const wantedTagsEl = ref<typeof Tags>(), unwantedTagsEl = ref<typeof Tags>();
const ratingLowerEl = ref<typeof Rating>(), ratingUpperEl = ref<typeof Rating>();
const fromMe = ref(false), onlyUnreviewed = ref(false), onlyStableRequest = ref(false);

let initWanted: string[] = [], initUnwanted: string[] = [];
let initRatingLower = 3, initRatingUpper = 10;

const filterDialog = ref<HTMLDialogElement>();

watch(
  () => route.query,
  () => {
    let q = route.query;
    if (isString(q.search)) tempSearchValue.value = searchValue.value = q.search;
    if (q.page) {
      let page = 1;
      try {
        page = parseInt(q.page as string);
      } catch (e) {}
      if (pagination.value) {
        pagination.value.current = page;
      } else {
        initPage = page;
      }
    }
    if (isString(q.division) && ['regular', 'troll', 'plain', 'visual'].includes(q.division)) {
      division.value = q.division;
    }
    if (isString(q.tags)) {
      let tags = q.tags.split(',');
      let wanted = [], unwanted = [];
      let ws = new Set(), uws = new Set();
      for (let tag of tags) {
        tag = tag.trim();
        if (tag.startsWith('-')) {
          tag = tag.substring(1).trim();
          if (tag.length && !uws.has(tag)) {
            unwanted.push(tag);
            uws.add(tag);
          }
        } else if (tag.length && !ws.has(tag)) {
          wanted.push(tag);
          ws.add(tag);
        }
      }
      initWanted = wanted;
      initUnwanted = unwanted;
    }
    if (isString(q.uploader)) {
      fromMe.value = user !== null && q.uploader === String(user.id);
    }
    if (isString(q.rating)) {
      let r = q.rating.split(',');
      if (r.length === 2) {
        try {
          initRatingLower = Math.max(0, Math.min(10, Math.round(parseFloat(r[0]) * 10)));
          initRatingUpper = Math.max(0, Math.min(10, Math.round(parseFloat(r[1]) * 10)));
        } catch (e) {}
      }
    }
    onlyUnreviewed.value = q.reviewed === 'false';
    onlyStableRequest.value = q.stableRequest === 'true';
    if (onlyUnreviewed.value) onlyStableRequest.value = false;
    if (['updated', '-updated', 'rating', '-rating', 'name', '-name'].includes(q.order as string)) {
      order.value = q.order as string;
    }
  },
  { immediate: true }
);

const wantedTags = ref<string[]>(initWanted), unwantedTags = ref<string[]>(initUnwanted);
const tempFromMe = ref(fromMe.value), tempOnlyUnreviewed = ref(onlyUnreviewed.value), tempOnlyStableRequest = ref(onlyStableRequest.value);
const ratingLower = ref(initRatingLower), ratingUpper = ref(initRatingUpper);

const parameters = computed(() => {
  let res: Record<string, string> = {
    page: String(pagination.value?.current ?? initPage),
    order: order.value,
  };
  if (division.value !== 'regular') {
    res.division = division.value;
  }
  if (wantedTags.value.length || unwantedTags.value.length) {
    let s = '';
    for (let tag of wantedTags.value) s += tag + ',';
    for (let tag of unwantedTags.value) s += '-' + tag + ',';
    if (s.endsWith(',')) s = s.substring(0, s.length - 1);
    res.tags = s;
  }
  if (searchValue.value?.length) {
    res.search = searchValue.value;
  }
  if (fromMe.value && user) {
    res.uploader = String(user?.id);
  }
  if (onlyUnreviewed.value) {
    res.reviewed = 'false';
    res.stableRequest = 'false';
  }
  if (onlyStableRequest.value) {
    res.stableRequest = 'true';
  }
  if (ratingLower.value !== 3 || ratingUpper.value !== 10) {
    res.rating = (ratingLower.value / 10) + ',' + (ratingUpper.value / 10);
  }
  return res;
});

async function fetchCharts() {
  charts.value = undefined;
  let params = {
    pageNum: String(PAGE_NUM),
    ...parameters.value
  };
  const resp = await fetchApi('/chart?' + new URLSearchParams(params)) as Page<Chart>;
  totalCount.value = resp.count;
  charts.value = resp.results;
}

await fetchCharts();

onMounted(() => {
  watch(parameters, (params) => {

    fetchCharts(); // do not wait
    router.push({ query: params });
  });
});

function saveFilters() {
  filterDialog.value!.close();
  wantedTags.value = [...wantedTagsEl.value!.tags];
  unwantedTags.value = [...unwantedTagsEl.value!.tags];
  fromMe.value = tempFromMe.value;
  onlyUnreviewed.value = tempOnlyUnreviewed.value;
  onlyStableRequest.value = tempOnlyStableRequest.value;
  ratingLower.value = ratingLowerEl.value!.selected;
  ratingUpper.value = ratingUpperEl.value!.selected;
}

</script>

<style>

.chart-card {
  animation: button-pop var(--animation-btn, 0.25s) ease-out;
}

.chart-card:active:hover, .chart-card:active:focus {
  animation: button-press 0.25s ease-out;
  transform: scale(0.97);
}

@keyframes button-press {
  from {
    transform: scale(1.0);
  }

  to {
    transform: scale(0.97);
  }
}

</style>

<template>
  <div class="flex flex-col items-center mt-8">
    <div class="mx-8 lg:w-3/4">
      <div class="flex flex-row items-end flex-wrap gap-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">
              谱面分区<i class="fa-solid fa-grip ml-2"></i>
            </span>
          </label>
          <select class="select select-bordered" v-model="division" @change="pagination!.current = 1">
            <option value="regular">常规</option>
            <option value="troll">整活</option>
            <option value="plain">纯配置</option>
            <option value="visual">观赏</option>
          </select>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">
              排序方式<i class="fa-solid fa-arrow-up-wide-short ml-2"></i>
            </span>
          </label>
          <select class="select select-bordered" v-model="order">
            <option value="-updated">时间顺序</option>
            <option value="updated">时间倒序</option>
            <option value="-rating">评分顺序</option>
            <option value="rating">评分倒序</option>
            <option value="name">名字正序</option>
            <option value="-name">名字倒序</option>
          </select>
        </div>
        <button class="btn btn-neutral" @click="filterDialog!.showModal()">
          <i class="fa-solid fa-filter"></i>
        </button>
        <div class="ml-auto join w-full lg:w-auto">
          <input class="input input-bordered join-item rounded-l-full w-full" placeholder="搜索" v-model="tempSearchValue" @keyup.enter="pagination!.current = 1; searchValue = tempSearchValue!" />
          <button class="btn btn-secondary join-item rounded-r-full" @click="pagination!.current = 1; searchValue = tempSearchValue!">
            <i class="fa-solid fa-search"></i>
          </button>
        </div>
      </div>
      <div v-if="charts" class="mt-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-h-0 min-w-0">
        <router-link v-for="chart in charts" :key="chart.id" :to="`/chart/${chart.id}`" class="group card relative image-full bg-base-100 shadow-xl aspect-[8/5] illustration chart-card min-h-0 min-w-0">
          <figure><img class="w-full aspect-[8/5]" :src="fileToURL(chart.illustration) + '.thumbnail'" /></figure>
          <div class="absolute right-0 badge badge-primary z-[11] m-2 text-lg p-3">{{ chart.level }}</div>
          <div class="card-body flex-col justify-end p-4 gap-0 min-h-0 min-w-0">
            <p class="flex-none text-sm">{{ chart.composer }}</p>
            <h2 class="card-title group-hover:link truncate">{{ chart.name }}</h2>
          </div>
        </router-link>
      </div>
      <div v-else class="flex flex-col items-center w-full h-16 mb-8">
        <Loader class="m-8 loading-lg"/>
      </div>
    </div>
    <Pagination :init="initPage" :total="pageCount(totalCount, PAGE_NUM)" class="mt-8 mb-16" ref="pagination" />
  </div>
  <dialog class="modal" ref="filterDialog">
    <div class="modal-box">
      <h3 class="font-bold text-lg">过滤条件</h3>
      <div class="flex flex-col gap-4 mt-4">
        <div class="flex flex-row gap-2">
          <button v-if="user" class="btn btn-neutral btn-outline flex-1" :class="{ 'btn-active': tempFromMe }" @click="tempFromMe = !tempFromMe">我上传的</button>
          <button v-if="user && Roles.from(user.roles).permissions(user.banned).has(Permission.SEE_UNREVIEWED)" class="btn btn-neutral btn-outline flex-1" :class="{ 'btn-active': tempOnlyUnreviewed }" @click="() => { if (tempOnlyUnreviewed = !tempOnlyUnreviewed) tempOnlyStableRequest = false; }">只看未审核</button>
          <button class="btn btn-neutral btn-outline flex-1" :class="{ 'btn-active': tempOnlyStableRequest }" @click="() => { if (tempOnlyStableRequest = !tempOnlyStableRequest) tempOnlyUnreviewed = false; }">只看上架申请</button>
        </div>
        <div class="divider my-0"></div>
        <div>
          <p>想包含的标签</p>
          <Tags class="mt-2" ref="wantedTagsEl" :init="initWanted" />
        </div>
        <div>
          <p>不想包含的标签</p>
          <Tags class="mt-2" ref="unwantedTagsEl" :init="initUnwanted" />
        </div>
        <div class="divider my-0"></div>
        <div class="flex flex-col">
          <p>评分下界</p>
          <Rating name="rating-lower" :init="initRatingLower" ref="ratingLowerEl" canBeZero />
        </div>
        <div class="flex flex-col mt-2">
          <p>评分上界</p>
          <Rating name="rating-upper" :init="initRatingUpper" ref="ratingUpperEl" canBeZero />
        </div>
        <div class="flex flew-row justify-end">
          <button class="btn btn-primary" @click="saveFilters">确定</button>
        </div>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button class="cursor-default" @click="saveFilters"></button>
    </form>
  </dialog>
</template>
