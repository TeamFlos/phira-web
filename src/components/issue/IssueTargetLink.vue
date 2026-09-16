<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { issueTargetLabel, issueTargetPath } from '../../issue';
import type { IssueTarget } from '../../model';

const props = defineProps<{ target?: IssueTarget | null }>();
const { t } = useI18n();

const label = computed(() => (props.target ? issueTargetLabel(props.target) : null));
</script>

<template>
  <router-link v-if="label" :to="issueTargetPath(target!)" class="link link-hover">{{ t(label.key, { id: label.id }) }}</router-link>
  <span v-else class="opacity-60" v-t="'issue-target.none'"></span>
</template>
