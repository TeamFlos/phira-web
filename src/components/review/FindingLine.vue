<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import type { MetadataFinding } from '../../review/metadata';

const { t } = useI18n();

defineProps<{ finding: MetadataFinding }>();
</script>

<template>
  <span class="flex items-center gap-1 text-xs" :class="finding.level === 'warning' ? 'text-warning' : 'text-info'">
    <i class="fa-solid shrink-0" :class="finding.level === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-info'"></i>
    {{ t(`metadata-finding.${finding.key}`) }}
  </span>
</template>
