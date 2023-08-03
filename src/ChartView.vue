<script setup lang="ts">

import { ref } from 'vue'
import { useRoute } from 'vue-router'

import { useFetchApi, fileToURL } from './common'
import type { Chart, User } from './model'

const fetchApi = useFetchApi();

const route = useRoute();

const id = parseInt(String(route.params.id));
const chart = await fetchApi(`/chart/${id}`) as Chart;

const uploader = ref<User>();
fetchApi(`/user/${chart.uploader}`, {}, (user) => { uploader.value = user as User; });

</script>

<template>
  <div class="flex flex-col items-center mt-8">
    <div class="mx-8 flex flex-col lg:flex-row lg:w-2/3 gap-8">
      <div class="card lg:w-3/4 bg-base-100 shadow-xl">
        <figure class="aspect-[8/5]"><div :style="{'background-image': 'url(' + fileToURL(chart.illustration) + ')'}" class="illustration w-full h-full"></div></figure>
        <div class="card-body">
          <h2 class="card-title">{{ chart.name }}</h2>
        </div>
      </div>
      <div class="lg:w-1/4">
        <div class="card bg-base-100 w-full p-4 flex-col items-center">
          <div v-if="!uploader" class="flex w-16 justify-center items-center">
            <div class="w-2/3 loading loading-spinner"></div>
          </div>
          <div v-if="uploader" class="flex flex-col w-full items-center">
            <div class="avatar">
              <div class="w-24 mask mask-squircle">
                <img v-if="uploader?.avatar" :src="fileToURL(uploader.avatar)" />
                <img src="./assets/user.png" />
              </div>
            </div>
            <p class="font-black text-xl mt-2">{{ uploader.name }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
