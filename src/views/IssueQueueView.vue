<i18n>
en:
  title: Ticket Queue
  empty: No tickets
  filter-all: All
  records: '{n} messages'

zh-CN:
  title: 工单队列
  empty: 暂无工单
  filter-all: 全部
  records: '{n} 条消息'
</i18n>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import moment from 'moment';

import { pageCount } from '../common';
import { useApi } from '../api/client';
import { ISSUE_OPERATIONS, statusLabelKey } from '../issue';
import type { IssueListItem, IssueOperation } from '../model';

import LoadView from '../components/LoadView.vue';
import PageIndicator from '../components/PageIndicator.vue';
import IssueCategoryBadge from '../components/issue/IssueCategoryBadge.vue';
import IssueStatusBadge from '../components/issue/IssueStatusBadge.vue';
import IssueSourceBadge from '../components/issue/IssueSourceBadge.vue';

const { t } = useI18n();
const api = useApi();
const route = useRoute();
const router = useRouter();

const PAGE_NUM = 20;

/** `all` or a concrete status; both the filter and the page live in the URL.
 * No param means the default: open (处理中), i.e. the pending work. */
function statusFromQuery(): IssueOperation | undefined {
  const s = String(route.query.status ?? '');
  if (s === 'all') return undefined;
  return (ISSUE_OPERATIONS as string[]).includes(s) ? (s as IssueOperation) : 'open';
}
function pageFromQuery(): number {
  const n = parseInt(String(route.query.page ?? ''));
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

const status = ref<IssueOperation | undefined>(statusFromQuery());
const initialPage = pageFromQuery();

const items = ref<IssueListItem[]>();
const totalCount = ref(0);
const pagination = ref<typeof PageIndicator>();

async function load(page: number) {
  items.value = undefined;
  const { data, error } = await api.GET('/issue', {
    params: { query: { page, pageSize: PAGE_NUM, status: status.value } },
    toastError: true,
  });
  if (error || !data) {
    items.value = [];
    return;
  }
  items.value = data.results as IssueListItem[];
  totalCount.value = data.count;
}

await load(initialPage);

function setStatus(next: IssueOperation | undefined) {
  if (status.value === next) return;
  status.value = next;
  if (pagination.value) pagination.value.current = 1;
  else load(1);
  router.replace({ query: { ...route.query, status: next ?? 'all', page: undefined } });
}

watch(
  () => pagination.value?.current,
  (page) => {
    if (page === undefined) return;
    load(page);
    // replace(): paging shouldn't spam history; undefined drops the param on page 1.
    if (page !== pageFromQuery()) router.replace({ query: { ...route.query, page: page > 1 ? String(page) : undefined } });
  },
);
</script>

<template>
  <div class="flex flex-col items-center px-4 lg:px-0 mb-24">
    <div class="w-full lg:w-3/4 flex flex-col gap-4">
      <h1 class="text-3xl font-black">{{ t('title') }}</h1>

      <div role="tablist" class="tabs tabs-boxed w-fit">
        <a role="tab" class="tab" :class="{ 'tab-active': !status }" @click="setStatus(undefined)">{{ t('filter-all') }}</a>
        <a v-for="s in ISSUE_OPERATIONS" :key="s" role="tab" class="tab" :class="{ 'tab-active': status === s }" @click="setStatus(s)">
          {{ t(statusLabelKey(s)) }}
        </a>
      </div>

      <LoadView v-if="!items" class="mx-auto loading-lg my-16" />
      <p v-else-if="!items.length" class="italic opacity-60 py-16 text-center" v-t="'empty'"></p>
      <div v-else class="flex flex-col gap-3">
        <router-link
          v-for="item in items"
          :key="item.id"
          :to="`/issue/${item.id}`"
          class="card bg-base-100 border border-base-300 shadow-lg p-4 flex flex-col gap-1 hover:bg-base-200 hover:border-primary transition-colors">
          <div class="break-words line-clamp-2">
            <span class="font-black opacity-70 mr-1">#{{ item.id }}</span>
            <span class="font-bold" :class="item.title ? '' : 'italic opacity-50'">{{ item.title || t('issue-untitled') }}</span>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <IssueCategoryBadge :category="item.category" />
            <IssueStatusBadge :status="item.status" />
            <IssueSourceBadge :source="item.source" />
            <span class="text-xs opacity-60 ml-auto shrink-0"> {{ moment(item.createdAt).fromNow() }} · {{ t('records', { n: item.recordCount }) }} </span>
          </div>
        </router-link>
      </div>

      <PageIndicator v-if="totalCount > PAGE_NUM" :init="initialPage" :total="pageCount(totalCount, PAGE_NUM)" class="mt-4" ref="pagination" />
    </div>
  </div>
</template>
