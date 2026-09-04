<i18n>
en:
  censor-hits: Blocked words

zh-CN:
  censor-hits: 屏蔽词
</i18n>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import type { CensorHit } from '../../review';

const { t } = useI18n();

defineProps<{ hits: CensorHit[] }>();
</script>

<template>
  <div v-if="hits.length" class="flex flex-col gap-1">
    <h3 class="text-xs font-bold tracking-wider opacity-50">{{ t('censor-hits') }}</h3>
    <div v-for="hit in hits" :key="hit.field" class="border border-base-300 rounded-lg p-2 text-sm">
      <span class="text-xs font-bold opacity-50">{{ t(`chart-field.${hit.field}`) }}</span>
      <p class="leading-relaxed whitespace-pre-wrap break-words">
        <span v-for="(seg, i) in hit.segments" :key="i" :class="seg.censored ? 'bg-error/30 text-error font-semibold rounded px-0.5' : ''">{{ seg.text }}</span>
      </p>
    </div>
  </div>
</template>
