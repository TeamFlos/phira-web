<i18n>
en:
  compare-with: Compare with
  only-changed: Only changed fields
  no-change: No differences between these two versions.
  empty: empty
  unchanged: unchanged
  updated: updated
  old: Old
  new: New
  direction: '#{from} → #{to}'

zh-CN:
  compare-with: 对比对象
  only-changed: 仅显示变更项
  no-change: 这两个版本之间没有差异。
  empty: 空
  unchanged: 未更改
  updated: 已更新
  old: 旧
  new: 新
  direction: '#{from} → #{to}'
</i18n>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { fileToURL } from '../common';
import { diffVersions } from '../version';
import type { ChartVersion } from '../model';

const { t } = useI18n();

const props = defineProps<{
  /** The older side of the comparison. */
  base: ChartVersion;
  /** The newer side of the comparison. */
  target: ChartVersion;
  /** Which of the two is the counterpart the user picked — i.e. not the version
   * selected in the timeline. This is what the picker below shows. */
  compareId: number;
  /** Every version the user may compare against, newest first. */
  candidates: ChartVersion[];
}>();

const emit = defineEmits<{ (e: 'update:compareId', id: number): void }>();

const onlyChanged = ref(true);

const rows = computed(() => diffVersions(props.base, props.target));

const shownRows = computed(() => {
  if (!onlyChanged.value) return rows.value;
  return rows.value.filter((r) => r.changed);
});
const anyChange = computed(() => rows.value.some((r) => r.changed));

function delta(from: number, to: number, digits: number): string {
  const d = to - from;
  return (d > 0 ? '+' : '') + d.toFixed(digits);
}

function onBaseChange(e: Event) {
  emit('update:compareId', Number((e.target as HTMLSelectElement).value));
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-4 flex-wrap bg-base-200 rounded-lg p-3">
      <div class="flex items-center gap-2">
        <span class="text-sm opacity-70" v-t="'compare-with'"></span>
        <select class="select select-bordered select-sm font-mono" :value="compareId" @change="onBaseChange">
          <option v-for="candidate in candidates" :key="candidate.id" :value="candidate.id">#{{ candidate.id }} · {{ t(`version-status.${candidate.status}`) }}</option>
        </select>
        <span class="badge badge-outline font-mono">{{ t('direction', { from: base.id, to: target.id }) }}</span>
      </div>
      <span class="grow"></span>
      <label class="label cursor-pointer gap-2 py-0">
        <span class="label-text" v-t="'only-changed'"></span>
        <input type="checkbox" class="toggle toggle-sm" v-model="onlyChanged" />
      </label>
    </div>

    <p v-if="!anyChange" class="italic opacity-60 py-4" v-t="'no-change'"></p>

    <div
      v-for="row in shownRows"
      :key="row.field"
      class="flex flex-col sm:flex-row gap-2 sm:gap-4 py-3 px-2 rounded-lg border-b border-base-300 last:border-0"
      :class="{ 'bg-base-200/40': row.changed }">
      <div class="sm:w-32 shrink-0 text-xs font-bold tracking-wider opacity-50 pt-1">
        {{ t(`chart-field.${row.field}`) }}
      </div>
      <div class="grow min-w-0">
        <!-- unchanged rows are shown flat, whatever their kind -->
        <template v-if="!row.changed">
          <span v-if="row.kind === 'text'" class="break-words" :class="[row.to.length ? 'opacity-70' : 'italic opacity-50', { 'whitespace-pre-wrap': row.multiline }]">
            {{ row.to.length ? row.to : t('empty') }}
          </span>
          <span v-else-if="row.kind === 'number'" class="opacity-70">{{ row.to.toFixed(row.digits) }}</span>
          <div v-else-if="row.kind === 'tags'" class="flex flex-wrap gap-1">
            <span v-for="tag in row.kept" :key="tag" class="badge badge-ghost">{{ tag }}</span>
            <span v-if="!row.kept.length" class="italic opacity-50" v-t="'empty'"></span>
          </div>
          <span v-else class="badge badge-ghost" v-t="'unchanged'"></span>
        </template>
        <!-- text: inline word/character diff -->
        <p v-else-if="row.kind === 'text'" class="break-words" :class="{ 'whitespace-pre-wrap': row.multiline }">
          <span v-if="!row.ops.length" class="italic opacity-50" v-t="'empty'"></span>
          <span
            v-for="(op, i) in row.ops"
            :key="i"
            :class="{
              'bg-error/25 line-through decoration-error': op.type === 'del',
              'bg-success/25': op.type === 'ins',
            }"
            >{{ op.text }}</span
          >
        </p>

        <!-- number: old → new (delta) -->
        <p v-else-if="row.kind === 'number'" class="flex items-center gap-2 flex-wrap">
          <span class="line-through opacity-60">{{ row.from.toFixed(row.digits) }}</span>
          <i class="fa-solid fa-arrow-right text-xs opacity-60"></i>
          <span class="font-semibold">{{ row.to.toFixed(row.digits) }}</span>
          <span class="badge badge-sm" :class="row.to > row.from ? 'badge-success' : 'badge-error'">
            {{ delta(row.from, row.to, row.digits) }}
          </span>
        </p>

        <!-- tags: added / removed chips -->
        <div v-else-if="row.kind === 'tags'" class="flex flex-wrap gap-1">
          <span v-for="tag in row.removed" :key="`-${tag}`" class="badge badge-error badge-outline line-through">{{ tag }}</span>
          <span v-for="tag in row.added" :key="`+${tag}`" class="badge badge-success badge-outline">{{ tag }}</span>
          <span v-for="tag in row.kept" :key="tag" class="badge badge-ghost">{{ tag }}</span>
        </div>

        <!-- opaque binaries: just say whether they moved -->
        <div v-else class="flex items-center gap-2 flex-wrap">
          <span class="badge badge-warning" v-t="'updated'"></span>
          <a class="link link-hover text-sm" :href="fileToURL(row.to)" target="_blank" rel="noreferrer">
            <i class="fa-solid fa-download"></i>
            {{ t('new') }}
          </a>
          <a class="link link-hover text-sm opacity-60" :href="fileToURL(row.from)" target="_blank" rel="noreferrer">
            <i class="fa-solid fa-download"></i>
            {{ t('old') }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
