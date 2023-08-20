<script setup lang="ts">
import { fileToURL } from '../common';
import type { EventList } from '../model';

const props = defineProps<{ event: EventList }>();
</script>

<template>
  <router-link :key="event.id" :to="`/event/${event.id}`" class="group card relative image-full bg-base-100 shadow-xl aspect-[8/5] illustration chart-card min-h-0 min-w-0">
    <figure>
      <img class="w-auto" :src="fileToURL(event.illustration)" />
    </figure>
    <div class="card-body flex-col justify-end p-4 gap-0 min-h-0 min-w-0 ">
      <p class="flex-none text-sm">{{ event.timeEnd }}</p>
      <h2 class="card-title group-hover:link truncate">
        {{ event.name }}
      </h2>
    </div>
  </router-link>
</template>
