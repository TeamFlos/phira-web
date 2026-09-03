<i18n>
en:
  description: Description
  description-empty: This version has no description.
  tags: Tags
  tags-empty: No tags.
  preview: Preview
  meta: Version info
  checksum: Checksum
  created-at: Submitted at
  download: Download chart
  open-in-phira: 在 Phira 中打开
  view-illustration: Open full illustration

zh-CN:
  description: 简介
  description-empty: 该版本没有简介。
  tags: 标签
  tags-empty: 没有标签。
  preview: 试听
  meta: 版本信息
  checksum: 校验和
  created-at: 提交于
  download: 下载谱面
  open-in-phira: 在 Phira 中打开
  view-illustration: 查看原图
</i18n>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { detailedTime, fileToURL } from '../common';
import { statusBadgeClass } from '../version';
import type { ChartVersion } from '../model';
import type { MetadataFinding } from '../review/metadata';

import TagList from './TagList.vue';
import FindingLine from './review/FindingLine.vue';

const { t } = useI18n();

const props = defineProps<{ version: ChartVersion; findings?: MetadataFinding[] }>();

const content = computed(() => props.version.content);

/** Full illustration preview modal. */
const illustrationOpen = ref(false);

/** Findings grouped by the snapshot field they attach to. */
const findingsByField = computed(() => {
  const map = new Map<string, MetadataFinding[]>();
  for (const f of props.findings ?? []) {
    const list = map.get(f.field) ?? [];
    list.push(f);
    map.set(f.field, list);
  }
  return map;
});

/** The at-a-glance fields, laid out next to the illustration. */
const fields = computed(() => [
  { key: 'name', label: t('chart-field.name'), value: content.value.name },
  { key: 'level', label: t('chart-field.difficulty'), value: `${content.value.level} (${content.value.difficulty.toFixed(1)})` },
  { key: 'composer', label: t('chart-field.composer'), value: content.value.composer },
  { key: 'charter', label: t('chart-field.charter'), value: content.value.charter },
  { key: 'illustrator', label: t('chart-field.illustrator'), value: content.value.illustrator },
  { key: 'noteCount', label: t('chart-field.noteCount'), value: String(content.value.noteCount) },
]);
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- header: version identity + actions -->
    <div class="flex items-center gap-2 flex-wrap">
      <span class="font-mono text-lg font-bold">#{{ version.id }}</span>
      <span class="badge" :class="statusBadgeClass(version.status)">{{ t(`version-status.${version.status}`) }}</span>
      <span class="grow"></span>
      <a class="btn btn-sm btn-outline" :href="fileToURL(content.file)" target="_blank" rel="noreferrer">
        <i class="fa-solid fa-download"></i>
        {{ t('download') }}
      </a>
      <a class="btn btn-sm btn-outline" :href="`https://phira.moe/dlink/import?src=${content.file}`" target="_blank" rel="noreferrer">
        <i class="fa-solid fa-arrow-up-right-from-square"></i>
        {{ t('open-in-phira') }}
      </a>
    </div>

    <!-- illustration + key fields -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="group relative w-full sm:w-64 shrink-0 self-start cursor-pointer" @click="illustrationOpen = true" v-tooltip="t('view-illustration')">
        <img class="w-full aspect-[8/5] object-cover rounded-lg border border-base-300 shadow-md" :src="fileToURL(content.illustration) + '.thumbnail'" />
        <span class="absolute inset-0 rounded-lg bg-base-100/0 group-hover:bg-base-100/30 transition-colors flex items-center justify-center">
          <i class="fa-solid fa-up-right-and-down-left-from-center opacity-0 group-hover:opacity-80 transition-opacity"></i>
        </span>
      </div>
      <div class="grow min-w-0 grid grid-cols-2 gap-x-6 gap-y-3 content-start">
        <div v-for="field in fields" :key="field.label" class="flex flex-col min-w-0">
          <span class="text-xs opacity-50">{{ field.label }}</span>
          <span class="truncate font-medium" v-tooltip="field.value">{{ field.value }}</span>
          <FindingLine v-for="finding in findingsByField.get(field.key) ?? []" :key="finding.key" class="mt-0.5" :finding="finding" />
        </div>
      </div>
    </div>

    <!-- description -->
    <section class="flex flex-col gap-2">
      <h3 class="text-xs font-bold tracking-wider opacity-50" v-t="'description'"></h3>
      <div class="bg-base-200 rounded-lg p-3">
        <p v-if="content.description && content.description.length" class="whitespace-pre-wrap break-words">{{ content.description }}</p>
        <p v-else class="italic opacity-50" v-t="'description-empty'"></p>
      </div>
      <FindingLine v-for="finding in findingsByField.get('description') ?? []" :key="finding.key" :finding="finding" />
    </section>

    <!-- tags -->
    <section class="flex flex-col gap-2">
      <h3 class="text-xs font-bold tracking-wider opacity-50" v-t="'tags'"></h3>
      <!-- TagList copies `init` into local state on setup, so re-key it per
           version to keep it in sync when the selection changes. -->
      <TagList v-if="content.tags.length" :key="version.id" :canEdit="false" :init="content.tags" />
      <span v-else class="italic opacity-50" v-t="'tags-empty'"></span>
      <FindingLine v-for="finding in findingsByField.get('tags') ?? []" :key="finding.key" :finding="finding" />
    </section>

    <!-- preview audio -->
    <section class="flex flex-col gap-2">
      <h3 class="text-xs font-bold tracking-wider opacity-50" v-t="'preview'"></h3>
      <audio class="w-full" controls preload="none" :src="fileToURL(content.preview)"></audio>
    </section>

    <!-- provenance -->
    <section class="flex flex-col gap-2">
      <h3 class="text-xs font-bold tracking-wider opacity-50" v-t="'meta'"></h3>
      <div class="bg-base-200 rounded-lg p-3 flex flex-col sm:flex-row gap-2 sm:gap-8 text-sm">
        <div class="flex flex-col min-w-0">
          <span class="text-xs opacity-50" v-t="'created-at'"></span>
          <span>{{ detailedTime(version.created) }}</span>
        </div>
        <div class="flex flex-col min-w-0">
          <span class="text-xs opacity-50" v-t="'checksum'"></span>
          <span class="font-mono truncate" v-tooltip="version.checksum">{{ version.checksum.slice(0, 16) }}</span>
        </div>
      </div>
    </section>
  </div>

  <!-- full illustration preview -->
  <Teleport to="body">
    <div v-if="illustrationOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" @click.self="illustrationOpen = false">
      <div class="relative">
        <img class="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain" :src="fileToURL(content.illustration)" />
        <button class="btn btn-sm btn-circle absolute -top-3 -right-3 bg-base-100 border border-base-300 shadow-md hover:bg-base-200" @click="illustrationOpen = false">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  </Teleport>
</template>
