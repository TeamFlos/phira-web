<i18n>
en:
  current: Current
  set-compare: Compare with this version
  empty: No version history

zh-CN:
  current: 当前版本
  set-compare: 与此版本对比
  empty: 暂无版本记录
</i18n>

<script setup lang="ts">
import moment from 'moment';
import { useI18n } from 'vue-i18n';

import { statusBadgeClass, statusDotClass, statusIcon } from '../version';
import type { ChartVersion } from '../model';

const { t } = useI18n();

defineProps<{
  versions: ChartVersion[];
  selectedId?: number;
  /** The version currently being diffed against the selected one. */
  compareId?: number;
}>();

const emit = defineEmits<{
  (e: 'select', id: number): void;
  (e: 'setCompare', id: number): void;
}>();
</script>

<template>
  <div>
    <ol v-if="versions.length" class="relative border-l-2 border-base-content/20 ml-3">
      <li v-for="version in versions" :key="version.id" class="mb-4 ml-6">
        <span class="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-base-100 text-xs" :class="statusDotClass(version.status)">
          <i class="fa-solid" :class="statusIcon(version.status)"></i>
        </span>
        <div
          class="rounded-lg p-2 transition-colors cursor-pointer hover:bg-base-200"
          :class="{ 'bg-base-200 ring-1 ring-primary': version.id === selectedId }"
          @click="emit('select', version.id)">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-mono text-sm">#{{ version.id }}</span>
            <span class="badge badge-sm whitespace-nowrap" :class="statusBadgeClass(version.status)">
              {{ t(`version-status.${version.status}`) }}
            </span>
            <span v-if="version.isPublished" class="badge badge-sm badge-outline badge-success whitespace-nowrap" v-t="'current'"></span>
          </div>
          <div class="flex items-center gap-2 mt-1">
            <time class="text-xs opacity-60 grow">{{ moment(version.created).fromNow() }}</time>
            <button
              class="btn btn-ghost btn-xs"
              :class="{ 'btn-active': version.id === compareId }"
              :disabled="version.id === selectedId"
              v-tooltip="t('set-compare')"
              @click.stop="emit('setCompare', version.id)">
              <i class="fa-solid fa-code-compare"></i>
            </button>
          </div>
        </div>
      </li>
    </ol>
    <p v-else class="italic opacity-60 py-4" v-t="'empty'"></p>
  </div>
</template>
