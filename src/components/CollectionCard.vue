<script setup lang="ts">
import { fileToURL } from '../common';
import type { PartialCollection } from '../model';

defineProps<{ collection: PartialCollection }>();
</script>

<template>
  <router-link
    :key="collection.id"
    :to="`/collection/${collection.id}`"
    class="group card relative image-full bg-base-100 shadow-xl aspect-[8/5] illustration chart-card min-h-0 min-w-0">
    <figure v-if="collection.cover">
      <img class="w-full aspect-[8/5]" :src="fileToURL(collection.cover) + '.thumbnail'" />
    </figure>
    <div class="card-body flex-col justify-end p-4 gap-0 min-h-0 min-w-0">
      <h2 class="card-title group-hover:link truncate">
        {{ collection.name }}
      </h2>
    </div>
  </router-link>
</template>
