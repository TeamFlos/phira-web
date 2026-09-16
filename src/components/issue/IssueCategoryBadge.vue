<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { categoryLabelKey } from '../../issue';
import type { IssueCategory } from '../../model';

defineProps<{ category: IssueCategory }>();
const { t } = useI18n();
</script>

<template>
  <span class="badge badge-neutral whitespace-nowrap">{{ t(categoryLabelKey(category)) }}</span>
</template>
