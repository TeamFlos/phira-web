<i18n>
en:
  title: My Tickets
  subtitle: Reports and feedback you submitted with this account.
  empty: You have not submitted any tickets yet.
  submit-new: Submit a new ticket
  records: '{n} messages'

zh-CN:
  title: 我的工单
  subtitle: 你用本账号提交的举报与反馈。
  empty: 还没有提交过工单。
  submit-new: 提交新工单
  records: '{n} 条消息'
</i18n>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import moment from 'moment';

import { pageCount } from '../common';
import { useApi } from '../api/client';
import type { MyIssue } from '../model';

import LoadView from '../components/LoadView.vue';
import PageIndicator from '../components/PageIndicator.vue';
import IssueCategoryBadge from '../components/issue/IssueCategoryBadge.vue';
import IssueStatusBadge from '../components/issue/IssueStatusBadge.vue';
import IssueTargetLink from '../components/issue/IssueTargetLink.vue';

const { t } = useI18n();
const api = useApi();
const route = useRoute();
const router = useRouter();

const PAGE_NUM = 20;

function pageFromQuery(): number {
  const n = parseInt(String(route.query.page ?? ''));
  return Number.isInteger(n) && n >= 1 ? n : 1;
}
const initialPage = pageFromQuery();

const items = ref<MyIssue[]>();
const totalCount = ref(0);
const pagination = ref<typeof PageIndicator>();

async function load(page: number) {
  items.value = undefined;
  const { data, error } = await api.GET('/me/issues', {
    params: { query: { page, pageSize: PAGE_NUM } },
    toastError: true,
  });
  if (error || !data) {
    items.value = [];
    return;
  }
  items.value = data.results as MyIssue[];
  totalCount.value = data.count;
}

await load(initialPage);

watch(
  () => pagination.value?.current,
  (page) => {
    if (page === undefined) return;
    load(page);
    if (page !== pageFromQuery()) router.replace({ query: { ...route.query, page: page > 1 ? String(page) : undefined } });
  },
);
</script>

<template>
  <div class="flex flex-col items-center px-4 lg:px-0 mb-24">
    <div class="w-full lg:w-2/3 flex flex-col gap-4">
      <div class="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 class="text-3xl font-black">{{ t('title') }}</h1>
          <p class="opacity-70 mt-1" v-t="'subtitle'"></p>
        </div>
        <router-link to="/issue/submit" class="btn btn-primary btn-sm"> <i class="fa-solid fa-plus"></i>{{ t('submit-new') }} </router-link>
      </div>

      <LoadView v-if="!items" class="mx-auto loading-lg my-16" />
      <p v-else-if="!items.length" class="italic opacity-60 py-16 text-center" v-t="'empty'"></p>
      <div v-else class="flex flex-col gap-3">
        <router-link
          v-for="item in items"
          :key="item.id"
          :to="`/issue/${item.id}`"
          class="card bg-base-100 border border-base-300 shadow-lg p-4 flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 hover:bg-base-200 hover:border-primary transition-colors">
          <span class="font-black opacity-70 shrink-0">#{{ item.id }}</span>
          <div class="flex items-center gap-2 flex-wrap min-w-0">
            <IssueCategoryBadge :category="item.category" />
            <IssueStatusBadge :status="item.status" />
            <IssueTargetLink :target="item.target" class="truncate" />
          </div>
          <span class="text-xs opacity-60 lg:ml-auto lg:text-right shrink-0" :title="moment(item.updatedAt).format('LLLL')"> {{ moment(item.updatedAt).fromNow() }} · {{ t('records', { n: item.recordCount }) }} </span>
        </router-link>
      </div>

      <PageIndicator v-if="totalCount > PAGE_NUM" :init="initialPage" :total="pageCount(totalCount, PAGE_NUM)" class="mt-4" ref="pagination" />
    </div>
  </div>
</template>
