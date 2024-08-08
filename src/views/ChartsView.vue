<i18n>
en:
  division:
    label: Division
    regular: Regular
    troll: Troll
    plain: Plain
    visual: Visual
  order:
    label: Order by
    time: Time desc.
    time-rev: Time asc.
    rating: Rating desc.
    rating-rev: Rating asc.
    name: Name asc.
    name-rev: Name desc.

  filter-opts: Filter options
  filters:
    from-me:
      any: Uploaded by me
      yes: Only uploaded by me
    unreviewed:
      any: Unreviewed
      no: Only reviewed
      yes: Only unreviewed
    stb:
      any: Stb.
      stb: Only stb.
      ranked: Only ranked
      unranked: Only unranked
      req: Only stb. request

  tags:
    wanted: Wanted tags
    unwanted: Unwanted tags

  rating:
    lower: Lowest rating
    upper: Highest rating

zh-CN:
  division:
    label: 谱面分区
    regular: 常规
    troll: 整活
    plain: 纯配置
    visual: 观赏
  order:
    label: 排序方式
    time: 时间顺序
    time-rev: 时间倒序
    rating: 评分顺序
    rating-rev: 评分倒序
    name: 名字正序
    name-rev: 名字倒序

  search: 搜索

  filter-opts: 过滤条件
  filters:
    from-me:
      any: 我上传的
      yes: 只看我上传的
    unreviewed:
      any: 未审核
      no: 只看审核过的
      yes: 只看未审核的
    stb:
      any: 上架申请
      stb: 全部上架谱
      ranked: 只看非特殊
      unranked: 只看特殊
      req: 只看上架申请

  tags:
    wanted: 想包含的标签
    unwanted: 不想包含的标签

  rating:
    lower: 评分下界
    upper: 评分上界

</i18n>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { useFetchApi, pageCount, isString, loggedIn, userPermissions } from '../common';

import { Permission } from '../model';
import type { Chart, Page, User } from '../model';

import ChartCard from '../components/ChartCard.vue';
import LoadView from '../components/LoadView.vue';
import PageIndicator from '../components/PageIndicator.vue';
import RatingBar from '../components/RatingBar.vue';
import TagList from '../components/TagList.vue';

const PAGE_NUM = 28;

const route = useRoute();
const router = useRouter();

const fetchApi = useFetchApi();

let user: User | null = null;
if (loggedIn()) {
  user = (await fetchApi('/me')) as User;
}

const pagination = ref<typeof PageIndicator>();

const totalCount = ref(0);
const charts = ref<Chart[]>();

let initPage = 1;
const searchValue = ref(''),
  tempSearchValue = ref<string>();
const division = ref('regular');
const order = ref('-updated');
const wantedTagsEl = ref<typeof TagList>(),
  unwantedTagsEl = ref<typeof TagList>();
const tempRatingLower = ref(3),
  tempRatingUpper = ref(10);
const fromMe = ref('any'),
  unreviewed = ref('any'),
  stable = ref('any');
const uploader = ref<number>();

let initWanted: string[] = [],
  initUnwanted: string[] = [];
const wantedTags = ref<string[]>(initWanted),
  unwantedTags = ref<string[]>(initUnwanted);

const filterDialog = ref<HTMLDialogElement>();
let triggeredByRouteChange = false,
  preventQueryUpdate = false;

watch(
  () => route.query,
  () => {
    if (preventQueryUpdate) {
      preventQueryUpdate = false;
      return;
    }
    triggeredByRouteChange = true;
    let q = route.query;
    tempSearchValue.value = searchValue.value = isString(q.search) ? q.search : '';

    let page = 1;
    if (q.page) {
      try {
        page = parseInt(q.page as string);
      } catch (e) {
        // empty
      }
    }
    if (pagination.value) {
      pagination.value.current = page;
    } else {
      initPage = page;
    }

    division.value = 'regular';
    if (isString(q.division) && ['regular', 'troll', 'plain', 'visual'].includes(q.division)) {
      division.value = q.division;
    }

    let wanted = [],
      unwanted = [];
    let ws = new Set(),
      uws = new Set();
    if (isString(q.tags)) {
      let tags = q.tags.split(',');
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
    }

    initWanted = wanted;
    initUnwanted = unwanted;
    wantedTags.value = wanted;
    unwantedTags.value = unwanted;
    if (wantedTagsEl.value) {
      wantedTagsEl.value!.tags.length = 0;
      wantedTagsEl.value!.tags.push(...wanted);
    }
    if (unwantedTagsEl.value) {
      unwantedTagsEl.value!.tags.length = 0;
      unwantedTagsEl.value!.tags.push(...unwanted);
    }

    fromMe.value = 'any';
    if (isString(q.fromMe) && ['any', 'yes'].includes(q.fromMe)) {
      fromMe.value = q.fromMe as string;
    }
    unreviewed.value = 'any';
    if (isString(q.unreviewed) && ['any', 'no', 'yes'].includes(q.unreviewed)) {
      unreviewed.value = q.unreviewed as string;
    }
    stable.value = 'any';
    if (isString(q.stable) && ['any', 'stb', 'ranked', 'unranked', 'req'].includes(q.stable)) {
      stable.value = q.stable as string;
    }

    uploader.value = undefined;
    if (isString(q.uploader)) {
      try {
        uploader.value = parseInt(q.uploader);
      } catch (e) {
        // empty
      }
    }

    tempRatingLower.value = 3;
    tempRatingUpper.value = 10;
    if (isString(q.rating)) {
      let r = q.rating.split(',');
      if (r.length === 2) {
        try {
          tempRatingLower.value = Math.max(0, Math.min(10, Math.round(parseFloat(r[0]) * 10)));
          tempRatingUpper.value = Math.max(0, Math.min(10, Math.round(parseFloat(r[1]) * 10)));
        } catch (e) {
          // empty
        }
      }
    }

    order.value = '-updated';
    if (['updated', '-updated', 'rating', '-rating', 'name', '-name'].includes(q.order as string)) {
      order.value = q.order as string;
    }
  },
  { immediate: true },
);

const tempFromMe = ref(fromMe.value),
  tempUnreviewed = ref(unreviewed.value),
  tempStable = ref(stable.value);
const ratingLower = ref(tempRatingLower.value),
  ratingUpper = ref(tempRatingUpper.value);

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
  if (uploader.value) {
    res.uploader = String(uploader.value);
  }
  if (fromMe.value !== 'any') {
    res.fromMe = fromMe.value;
  }
  if (unreviewed.value !== 'any') {
    res.unreviewed = unreviewed.value;
  }
  if (stable.value !== 'any') {
    res.stable = stable.value;
  }
  if (ratingLower.value !== 3 || ratingUpper.value !== 10) {
    res.rating = ratingLower.value / 10 + ',' + ratingUpper.value / 10;
  }
  return res;
});

async function fetchCharts() {
  charts.value = undefined;
  let params: Record<string, string> = {
    pageNum: String(PAGE_NUM),
    ...parameters.value,
  };
  delete params.fromMe;
  delete params.unreviewed;
  delete params.stable;

  let fromMe = parameters.value.fromMe,
    unreviewed = parameters.value.unreviewed,
    stable = parameters.value.stable;
  if (fromMe === 'yes' && user) {
    params.uploader = String(user?.id);
  }
  if (unreviewed && unreviewed !== 'any') {
    params.reviewed = unreviewed === 'yes' ? 'false' : 'true';
  }
  if (stable && !['any', 'req'].includes(stable)) {
    params.stable = 'true';
  }
  switch (stable) {
    case 'ranked':
      params.ranked = 'true';
      break;
    case 'unranked':
      params.ranked = 'false';
      break;
    case 'req':
      params.stableRequest = 'true';
      break;
  }

  const resp = (await fetchApi('/chart?' + new URLSearchParams(params))) as Page<Chart>;
  totalCount.value = resp.count;
  charts.value = resp.results;
}

await fetchCharts();

onMounted(() => {
  triggeredByRouteChange = false;
  watch(parameters, (params) => {
    fetchCharts(); // do not wait
    if (triggeredByRouteChange) triggeredByRouteChange = false;
    else {
      preventQueryUpdate = true;
      router.push({ query: params });
    }
  });
});

function saveFilters() {
  filterDialog.value!.close();
  wantedTags.value = [...wantedTagsEl.value!.tags];
  unwantedTags.value = [...unwantedTagsEl.value!.tags];
  fromMe.value = tempFromMe.value;
  unreviewed.value = tempUnreviewed.value;
  stable.value = tempStable.value;
  ratingLower.value = tempRatingLower.value;
  ratingUpper.value = tempRatingUpper.value;
  pagination.value!.current = 1;
}

function rotate(value: string, choices: string[]): string {
  return choices[choices.indexOf(value) + 1] ?? choices[0];
}
</script>

<style>
.chart-card {
  animation: button-pop var(--animation-btn, 0.25s) ease-out;
}

.chart-card:active:hover,
.chart-card:active:focus {
  animation: button-press 0.25s ease-out;
  transform: scale(0.97);
}

@keyframes button-press {
  from {
    transform: scale(1);
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
            <span class="label-text"> {{ t('division.label') }}<i class="fa-solid fa-grip ml-2"></i> </span>
          </label>
          <select class="select select-bordered" v-model="division" @change="pagination!.current = 1">
            <option value="regular" v-t="'division.regular'"></option>
            <option value="troll" v-t="'division.troll'"></option>
            <option value="plain" v-t="'division.plain'"></option>
            <option value="visual" v-t="'division.visual'"></option>
          </select>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text"> {{ t('order.label') }}<i class="fa-solid fa-arrow-up-wide-short ml-2"></i> </span>
          </label>
          <select class="select select-bordered" v-model="order">
            <option value="-updated" v-t="'order.time'"></option>
            <option value="updated" v-t="'order.time-rev'"></option>
            <option value="-rating" v-t="'order.rating'"></option>
            <option value="rating" v-t="'order.rating-rev'"></option>
            <option value="name" v-t="'order.name'"></option>
            <option value="-name" v-t="'order.name-rev'"></option>
          </select>
        </div>
        <button class="btn bg-base-100 btn-outline" @click="filterDialog!.showModal()">
          <i class="fa-solid fa-filter"></i>
        </button>
        <div class="ml-auto join w-full lg:w-auto">
          <input class="input input-bordered join-item rounded-l-full w-full" :placeholder="t('search')"
            v-model="tempSearchValue" @keyup.enter="
              pagination!.current = 1;
            searchValue = tempSearchValue!;
            " />
          <button class="btn btn-secondary join-item rounded-r-full" @click="
            pagination!.current = 1;
          searchValue = tempSearchValue!;
          ">
            <i class="fa-solid fa-search"></i>
          </button>
        </div>
      </div>
      <div v-if="charts"
        class="mt-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-h-0 min-w-0">
        <ChartCard v-for="chart in charts" :key="chart.id" :chart="chart"></ChartCard>
      </div>
      <div v-else class="flex flex-col items-center w-full h-16 mb-8 p-8">
        <LoadView class="loading-lg" />
      </div>
    </div>
    <PageIndicator :init="initPage" :total="pageCount(totalCount, PAGE_NUM)" class="mt-8 mb-16" ref="pagination" />
  </div>
  <dialog class="modal" ref="filterDialog">
    <div class="modal-box">
      <h3 class="font-bold text-lg" v-t="'filter-opts'"></h3>
      <div class="flex flex-col gap-4 mt-4">
        <div class="flex flex-row gap-2">
          <button v-if="user" class="btn btn-neutral btn-outline flex-1" :class="{ 'btn-active': tempFromMe !== 'any' }"
            @click="tempFromMe = rotate(tempFromMe, ['any', 'yes'])" v-t="'filters.from-me.' + tempFromMe"></button>
          <button v-if="user && userPermissions(user).has(Permission.SEE_UNREVIEWED)"
            class="btn btn-neutral btn-outline flex-1" :class="{ 'btn-active': tempUnreviewed !== 'any' }"
            @click="tempUnreviewed = rotate(tempUnreviewed, ['any', 'no', 'yes'])"
            v-t="'filters.unreviewed.' + tempUnreviewed"></button>
          <button class="btn btn-neutral btn-outline flex-1" :class="{ 'btn-active': tempStable !== 'any' }"
            @click="tempStable = rotate(tempStable, ['any', 'stb', 'ranked', 'unranked', 'req'])"
            v-t="'filters.stb.' + tempStable"></button>
        </div>
        <div class="divider my-0"></div>
        <div>
          <p v-t="'tags.wanted'"></p>
          <TagList class="mt-2" ref="wantedTagsEl" :init="initWanted" />
        </div>
        <div>
          <p v-t="'tags.unwanted'"></p>
          <TagList class="mt-2" ref="unwantedTagsEl" :init="initUnwanted" />
        </div>
        <div class="divider my-0"></div>
        <div class="flex flex-col">
          <p v-t="'rating.lower'"></p>
          <RatingBar name="rating-lower" v-model="tempRatingLower" canBeZero />
        </div>
        <div class="flex flex-col mt-2">
          <p v-t="'rating.upper'"></p>
          <RatingBar name="rating-upper" v-model="tempRatingUpper" canBeZero />
        </div>
        <div class="flex flew-row justify-end">
          <button class="btn btn-primary" @click="saveFilters" v-t="'confirm'"></button>
        </div>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button class="cursor-default" @click="saveFilters"></button>
    </form>
  </dialog>
</template>
