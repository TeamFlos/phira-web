<script setup lang="ts">

import { useFetchApi, fileToURL } from '../common'
import type { StbHistory, User } from '../model'

import moment from 'moment'

const props = defineProps<{ chart: number, uploader: number }>();

const fetchApi = useFetchApi();

const history = await fetchApi(`/chart/${props.chart}/stabilize-history`) as StbHistory[];
const uploader = await fetchApi(`/user/${props.uploader}`) as User;

</script>

<template>
  <div class="px-4">
    <ol class="relative border-l border-gray-200 dark:border-gray-700 p-2">
      <li v-for="item in history" v-bind:key="item.id" class="mb-10 ml-4">
        <span class="absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 bg-base-100 ring-8 ring-base-100">
          <img v-if="item?.reviewerAvatar" class="rounded-full shadow-lg" :src="fileToURL(item.reviewerAvatar)"/>
          <img v-if="(!item?.reviewerAvatar) && uploader.avatar" class="rounded-full shadow-lg" :src="fileToURL(uploader.avatar)"/>
          <img v-if="(!item?.reviewerAvatar) && !uploader.avatar" class="rounded-full shadow-lg" src="../assets/user.png" />
        </span>
        <time class="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">{{ moment(item.time).fromNow() + ' (' + moment(item.time).format('lll') + ')' }}</time>
        <br/>
        <div v-if="!item.reviewer" class="italic">{{ uploader.name }} 提交了上架申请</div>
        <div v-if="item.reviewer && item.comment" class="mb-4">
          <span class="text-gray-400 italic">{{ item.reviewerName }} 评论：</span>
          {{ item.comment }}
        </div>
        <p v-if="item.reviewer && !item.comment" class="mb-4 italic">{{ item.reviewerName }} {{ item.approve? '通过': '拒绝' }}了谱面</p>
      </li>
    </ol>
  </div>
</template>
