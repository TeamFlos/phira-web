<script setup lang="ts">

import { useRoute } from 'vue-router'

import { useFetchApi, fileToURL, userNameClass, detailedTime, LANGUAGES } from './common'
import type { User } from './model'

import Property from './components/Property.vue'
import UserCard from './components/UserCard.vue'

const route = useRoute();

const fetchApi = useFetchApi();

const id = parseInt(String(route.params.id));
const user = await fetchApi(`/user/${id}`) as User;

const stats = await fetchApi(`/user/${id}/stats`) as {
  numRecords: number,
  avgAccuracy: number,
};

</script>

<template>
  <div class="flex flex-row justify-center">
    <div class="lg:w-3/4 mx-8">
      <div class="card card-compact bg-base-100 shadow-xl">
        <figure><img src="./assets/banner.jpg" class="object-cover max-h-[30vh] w-full" /></figure>
        <div class="card-body">
          <div class="flex flex-col lg:flex-row items-center lg:items-start">
            <div class="avatar lg:ml-6 -mt-14">
              <div class="w-32 mask mask-squircle">
                <img v-if="user?.avatar" :src="fileToURL(user.avatar)" />
                <img v-if="!user?.avatar" src="./assets/user.png" />
              </div>
            </div>
            <div class="flex flex-col items-center mt-3 lg:mt-0 lg:ml-4 lg:items-start grow">
              <p class="font-black text-3xl" :class="[userNameClass(user.badges)]">{{ user.name }}</p>
              <p v-if="user.bio" class="whitespace-nowrap">{{ user.bio }}</p>
              <p v-if="!user.bio" class="text-sm italic text-gray-500">该用户还没有简介</p>
            </div>
            <div class="flex flex-row lg:-mt-4">
              <div class="stat">
                <div class="stat-title text-center">总游玩次数</div>
                <div class="stat-value text-center">{{ stats.numRecords }}</div>
              </div>
              <div class="stat">
                <div class="stat-title text-center">平均准确率</div>
                <div class="stat-value text-center">{{ (stats.avgAccuracy * 100).toFixed(2) + '%' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-row mt-4">
        <div class="card bg-base-100 shadow-xl lg:w-1/4 p-4">
          <div class="flex flex-col w-full gap-2">
            <Property title="上次登录于" :value="detailedTime(user.last_login)" />
            <Property title="注册于" :value="detailedTime(user.joined)" />
            <Property title="语言" :value="LANGUAGES[user.language as (keyof typeof LANGUAGES)]" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
