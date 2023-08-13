<script setup lang="ts">

import { useFetchApi, fileToURL, detailedTime } from '../common'
import type { StbHistory, User } from '../model'

import UserAvatar from './UserAvatar.vue'

const props = defineProps<{ chart: number, uploader: number }>();

const fetchApi = useFetchApi();

const history = await fetchApi(`/chart/${props.chart}/stabilize-history`) as StbHistory[];
const uploader = await fetchApi(`/user/${props.uploader}`) as User;

</script>

<template>
  <div class="px-4">
    <ol v-if="history.length" class="relative border-l border-gray-200 dark:border-gray-700 p-2">
      <li v-for="item in history" v-bind:key="item.id" class="mb-10 ml-4">
        <router-link v-if="item.approve === null || item.reviewer !== null" class="absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 bg-base-100 ring-8 ring-base-100" :to="`/user/${item.reviewer ?? uploader.id}`">
          <UserAvatar class="rounded-full shadow-lg" :url="item.reviewerAvatar ?? uploader.avatar"/>
        </router-link>
        <time class="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">{{ detailedTime(item.time) }}</time>
        <br/>
        <div v-if="!item.reviewer" class="italic">
          <p v-if="item.approve === null"><router-link :to="`/user/${uploader.id}`" class="link link-hover">{{ uploader.name }}</router-link> 提交了上架申请</p>
          <p v-else-if="item.approve">谱面上架申请通过</p>
          <p v-else>谱面上架申请被拒</p>
        </div>
        <div v-else-if="item.comment || item.comment === ''" class="mb-4">
          <span class="text-gray-400 italic"><router-link :to="`/user/${item.reviewer}`" class="link link-hover">{{ item.reviewerName }}</router-link> 评论：</span>
          {{ item.comment }}
        </div>
        <p v-else class="mb-4 italic"><router-link :to="`/user/${item.reviewer}`" class="link link-hover">{{ item.reviewerName }}</router-link> {{ item.approve? '通过': '拒绝' }}了谱面</p>
      </li>
    </ol>
    <div v-if="!history.length" class="text-center italic py-8">
      暂无评议记录
    </div>
  </div>
</template>
