<script setup lang="ts">

import { useFetchApi, fileToURL } from './common'
import { Chart } from './model'

const fetchApi = useFetchApi();

const { count, results: charts } = await fetchApi('/chart') as { count: number, results: Chart[] };


</script>

<template>
  <div class="flex justify-center mt-8">
    <div class="mx-8 mt mb-16 lg:w-3/4">
      <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <router-link v-for="chart in charts" :key="chart.count" :to="`/chart/${chart.id}`" class="card relative image-full bg-base-100 shadow-xl aspect-[8/5] bg-center bg-no-repeat bg-cover">
          <figure><img :src="fileToURL(chart.illustration)" /></figure>
          <div class="absolute right-0 badge badge-primary z-[11] m-2 text-lg p-3">{{ chart.level }}</div>
          <div class="card-body flex-col justify-end p-4 gap-0">
            <p class="flex-none text-sm">{{ chart.composer }}</p>
            <h2 class="card-title">{{ chart.name }}</h2>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>
