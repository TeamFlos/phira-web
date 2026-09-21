<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { sourceLabelKey } from '../../issue';
import type { IssueSource } from '../../model';

defineProps<{ source: IssueSource }>();
const { t } = useI18n();
</script>

<template>
  <span class="badge badge-outline whitespace-nowrap">
    <i class="fa-solid text-[0.6rem]" :class="source === 'mail' ? 'fa-envelope' : 'fa-globe'"></i>
    {{ t(sourceLabelKey(source)) }}
  </span>
</template>
