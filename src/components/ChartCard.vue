<i18n>
en:
  unreviewed: Unreviewed
  stable-request: Stable request pending

zh-CN:
  unreviewed: 未审核
  stable-request: 正在请求 stable
</i18n>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { fileToURL } from '../common';
import type { Chart } from '../model';

const { t } = useI18n();
defineProps<{ chart: Chart }>();
</script>

<template>
  <router-link :key="chart.id" :to="`/chart/${chart.id}`" class="group card relative image-full bg-base-100 shadow-xl aspect-[8/5] illustration chart-card min-h-0 min-w-0">
    <figure>
      <img class="w-full aspect-[8/5]" :src="fileToURL(chart.illustration) + '.thumbnail'" />
    </figure>
    <span
      v-if="!chart.reviewed"
      class="absolute top-2 left-3 z-[11] text-2xl font-bold leading-none text-white"
      role="img"
      :title="t(chart.stableRequest ? 'stable-request' : 'unreviewed')"
      :aria-label="t(chart.stableRequest ? 'stable-request' : 'unreviewed')">
      {{ chart.stableRequest ? '+' : '*' }}
    </span>
    <div class="absolute right-0 badge badge-primary z-[11] m-2 text-lg p-3">
      {{ chart.level }}
    </div>
    <div class="card-body flex-col justify-end p-4 gap-0 min-h-0 min-w-0">
      <p class="flex-none text-sm">{{ chart.composer }}</p>
      <h2 class="card-title group-hover:link truncate">
        {{ chart.name }}
      </h2>
    </div>
  </router-link>
</template>
