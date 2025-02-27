<i18n>
en:
  stb-request: '{0} requested to stabilize the chart'
  stb-action:
    approve: '{0} approved the request'
    deny: '{0} denied the request'
  stb-result:
    approve: Stabilization approved
    deny: Stabilization denied
  comment: '{0} commented: {1}'
  history-empty: 'No history'

  steps:
    reviewed: Reviewed
    request: Submit request
    done: Stabilized
    approve: 'No approves | 1 approve: | {count} approves:'
    deny: 'No denies: | 1 deny: | {count} denies:'

zh-CN:
  stb-request: '{0} 提交了上架申请'
  stb-action:
    approve: '{0} 通过了谱面'
    deny: '{0} 拒绝了谱面'
  stb-result:
    approve: 谱面上架申请通过
    deny: 谱面上架申请被拒
  comment: '{0} 评论：{1}'
  history-empty: 暂无评议记录

  steps:
    reviewed: 通过审核
    request: 申请上架
    done: 谱面上架
    approve: '无人通过 | 1 人通过： | {count} 人通过：'
    deny: '无人拒绝 | 1 人拒绝： | {count} 人拒绝：'

</i18n>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { useFetchApi, detailedTime } from '../common';
import type { StbStatus, User } from '../model';

import UserAvatar from './UserAvatar.vue';

const props = defineProps<{ chart: number; uploader: number }>();

const fetchApi = useFetchApi();

const status = (await fetchApi(`/chart/${props.chart}/stabilize-status`)) as StbStatus;
const uploader = (await fetchApi(`/user/${props.uploader}`)) as User;
</script>

<template>
  <div class="px-4 flex flex-col">
    <ul class="steps steps-vertical lg:steps-horizontal my-4">
      <li class="step step-primary" v-t="'steps.reviewed'"></li>
      <li class="step" :class="{ 'step-primary': status.stable || status.stableRequest }">
        <div class="text-left lg:text-center">
          <p>{{ t('steps.request') }}</p>
          <template v-if="status.stableRequest">
            <span>{{ t('steps.approve', status.approves.length) }}</span>
            <template v-for="(user, index) in status.approves" :key="user.id">
              <span v-if="index > 0">, </span>
              <router-link :to="`/user/${user.id}`" class="link link-hover">{{ user.name }}</router-link>
            </template>
            <br />
            <span>{{ t('steps.deny', status.denies.length) }}</span>
            <template v-for="(user, index) in status.denies" :key="user.id">
              <span v-if="index > 0">, </span>
              <router-link :to="`/user/${user.id}`" class="link link-hover">{{ user.name }}</router-link>
            </template>
          </template>
        </div>
      </li>
      <li class="step" :class="{ 'step-primary': status.stable }" v-t="'steps.done'"></li>
    </ul>
    <ol v-if="status.history.length" class="relative border-l border-gray-200 dark:border-gray-700 p-2">
      <li v-for="item in status.history" :key="item.id" class="mb-10 ml-4">
        <router-link
          v-if="item.approve === null || item.reviewer !== null"
          class="absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 bg-base-100 ring-8 ring-base-100"
          :to="`/user/${item.reviewer ?? uploader.id}`">
          <UserAvatar class="rounded-full shadow-lg" :url="item.reviewer ? item.reviewerAvatar : (item.approve === null ? uploader.avatar : undefined)" />
        </router-link>
        <time class="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">{{ detailedTime(item.time) }}</time>
        <br />
        <div v-if="!item.reviewer" class="italic">
          <i18n-t v-if="item.approve === null" tag="p" keypath="stb-request">
            <router-link :to="`/user/${uploader.id}`" class="link link-hover">{{ uploader.name }}</router-link>
          </i18n-t>
          <p v-else-if="item.approve" v-t="'stb-result.approve'"></p>
          <p v-else v-t="'stb-result.deny'"></p>
        </div>
        <div v-else-if="item.comment || item.comment === ''" class="mb-4">
          <i18n-t tag="span" keypath="comment" class="italic">
            <router-link :to="`/user/${item.reviewer}`" class="link link-hover">{{ item.reviewerName }}</router-link>
            <span class="not-italic">{{ item.comment }}</span>
          </i18n-t>
        </div>
        <i18n-t v-else tag="p" :keypath="item.approve ? 'stb-action.approve' : 'stb-action.deny'" class="mb-4 italic">
          <router-link :to="`/user/${item.reviewer}`" class="link link-hover">{{ item.reviewerName }}</router-link>
        </i18n-t>
      </li>
    </ol>
    <div v-if="!status.history.length" class="text-center italic py-8">
      {{ t('history-empty') }}
    </div>
  </div>
</template>
