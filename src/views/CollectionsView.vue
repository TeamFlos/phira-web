<i18n>
en:
  order:
    label: Order by
    time: Time desc.
    time-rev: Time asc.
    name: Name asc.
    name-rev: Name desc.
    likes: Most liked

  from-me: From me only

  search: Search

  rating:
    lower: Lowest rating
    upper: Highest rating

zh-CN:
  order:
    label: 排序方式
    time: 时间顺序
    time-rev: 时间倒序
    name: 名字正序
    name-rev: 名字倒序
    likes: 最多点赞

  from-me: 仅我创建

  search: 搜索

  rating:
    lower: 评分下界
    upper: 评分上界

</i18n>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { useFetchApi, pageCount, isString, loggedIn } from '../common';

import type { Page, PartialCollection, User } from '../model';

import LoadView from '../components/LoadView.vue';
import PageIndicator from '../components/PageIndicator.vue';
import CollectionCard from '@/components/CollectionCard.vue';

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
const collections = ref<PartialCollection[]>();

let initPage = 1;
const searchValue = ref(''),
  tempSearchValue = ref<string>();
const order = ref('-updated');
const fromMe = ref(false);
const uploader = ref<number>();

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

    fromMe.value = q.fromMe === 'yes';

    uploader.value = undefined;
    if (isString(q.uploader)) {
      try {
        uploader.value = parseInt(q.uploader);
      } catch (e) {
        // empty
      }
    }

    order.value = '-updated';
    if (['updated', '-updated', 'name', '-name', '-likes'].includes(q.order as string)) {
      order.value = q.order as string;
    }
  },
  { immediate: true },
);

const parameters = computed(() => {
  let res: Record<string, string> = {
    page: String(pagination.value?.current ?? initPage),
    order: order.value,
  };
  if (searchValue.value?.length) {
    res.search = searchValue.value;
  }
  if (uploader.value) {
    res.uploader = String(uploader.value);
  }
  if (fromMe.value) {
    res.fromMe = 'yes';
  }
  return res;
});

async function fetchCollections() {
  collections.value = undefined;
  let params: Record<string, string> = {
    pageNum: String(PAGE_NUM),
    ...parameters.value,
  };
  delete params.fromMe;
  if (params.uploader) {
    params.owner = params.uploader;
    delete params.uploader;
  }

  let fromMe = parameters.value.fromMe;
  if (fromMe === 'yes' && user) {
    params.owner = String(user?.id);
  }

  const resp = (await fetchApi('/collection?' + new URLSearchParams(params))) as Page<PartialCollection>;
  totalCount.value = resp.count;
  collections.value = resp.results;
}

await fetchCollections();

onMounted(() => {
  triggeredByRouteChange = false;
  watch(parameters, (params) => {
    fetchCollections(); // do not wait
    if (triggeredByRouteChange) triggeredByRouteChange = false;
    else {
      preventQueryUpdate = true;
      router.push({ query: params });
    }
  });
});
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
            <span class="label-text"> {{ t('order.label') }}<i class="fa-solid fa-arrow-up-wide-short ml-2"></i> </span>
          </label>
          <select class="select select-bordered" v-model="order">
            <option value="-updated" v-t="'order.time'"></option>
            <option value="updated" v-t="'order.time-rev'"></option>
            <option value="name" v-t="'order.name'"></option>
            <option value="-name" v-t="'order.name-rev'"></option>
            <option value="-likes" v-t="'order.likes'"></option>
          </select>
        </div>
        <div v-if="user" class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text mr-2"> {{ t('from-me') }} </span>
            <input type="checkbox" class="checkbox" v-model="fromMe" />
          </label>
        </div>
        <div class="ml-auto join w-full lg:w-auto">
          <input
            class="input input-bordered join-item rounded-l-full w-full"
            :placeholder="t('search')"
            v-model="tempSearchValue"
            @keyup.enter="
              pagination!.current = 1;
              searchValue = tempSearchValue!;
            " />
          <button
            class="btn btn-secondary join-item rounded-r-full"
            @click="
              pagination!.current = 1;
              searchValue = tempSearchValue!;
            ">
            <i class="fa-solid fa-search"></i>
          </button>
        </div>
      </div>
      <div v-if="collections" class="mt-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-h-0 min-w-0">
        <CollectionCard v-for="collection in collections" :key="collection.id" :collection="collection" />
      </div>
      <div v-else class="flex flex-col items-center w-full h-16 mb-8 p-8">
        <LoadView class="loading-lg" />
      </div>
    </div>
    <PageIndicator :init="initPage" :total="pageCount(totalCount, PAGE_NUM)" class="mt-8 mb-16" ref="pagination" />
  </div>
</template>
