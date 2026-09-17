<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { issueTargetLabel, issueTargetPath } from '../../issue';
import type { IssueTarget } from '../../model';

defineProps<{ target?: IssueTarget | null }>();
const { t } = useI18n();
</script>

<template>
  <router-link v-if="target" :to="issueTargetPath(target)" class="link link-hover">{{ t(issueTargetLabel(target)) }} #{{ target.id }}</router-link>
  <span v-else class="opacity-60" v-t="'issue-target.none'"></span>
</template>
