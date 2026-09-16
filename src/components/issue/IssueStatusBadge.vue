<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { statusBadgeClass, statusLabelKey } from '../../issue';
import type { IssueOperation } from '../../model';

defineProps<{ status: IssueOperation }>();
const { t } = useI18n();
</script>

<template>
  <span class="badge whitespace-nowrap" :class="statusBadgeClass(status)">{{ t(statusLabelKey(status)) }}</span>
</template>
