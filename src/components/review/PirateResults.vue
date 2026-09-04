<i18n>
en:
  stolen-hint: 'File is byte-identical to another uploader''s chart. Likely piracy. Reject unless the uploader is the original author; a rejected/yanked match means a repeat upload after moderation.'
  duplicate-hint: 'File is byte-identical to another chart by the same uploader. A duplicate, not piracy.'
  stolen-matched: Stolen file found in
  duplicate-matched: Same-uploader duplicate of
  uploader: 'Uploader:'
zh-CN:
  stolen-hint: 与其他上传者的谱面完全一致，疑似盗传。非原作者应拒绝；命中已拒绝/已撤下版本说明被处理后重传。
  duplicate-hint: 与同一上传者的其他谱面完全一致，属于重复上传，非盗传。
  stolen-matched: 盗传撞车记录
  duplicate-matched: 同一上传者重复
  uploader: 上传者：
</i18n>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import type { PirateMatch } from '../../model';
import { statusBadgeClass, versionStatusOf } from '../../version';

const { t } = useI18n();

defineProps<{ kind: 'stolen' | 'duplicate'; matches: PirateMatch[] }>();
</script>

<template>
  <div class="alert text-sm py-2" :class="kind === 'stolen' ? 'alert-error' : 'alert-warning'">
    <i class="fa-solid" :class="kind === 'stolen' ? 'fa-copy' : 'fa-clone'"></i>
    <span>{{ t(kind === 'stolen' ? 'stolen-hint' : 'duplicate-hint') }}</span>
  </div>

  <div class="flex flex-col gap-1">
    <h3 class="text-xs font-bold tracking-wider opacity-50">{{ t(kind === 'stolen' ? 'stolen-matched' : 'duplicate-matched') }}</h3>
    <div v-for="(m, i) in matches" :key="i" class="border border-base-300 rounded-lg p-2 flex flex-col gap-1 text-sm">
      <div class="flex flex-row items-center gap-2 flex-wrap">
        <router-link :to="`/chart/${m.chartId}`" class="font-bold link">{{ m.name }}</router-link>
        <span class="badge badge-sm badge-ghost">#{{ m.chartId }}</span>
        <span v-if="m.versionStatus != null && versionStatusOf(m.versionStatus)" class="badge badge-sm" :class="statusBadgeClass(versionStatusOf(m.versionStatus)!)">
          {{ t(`version-status.${versionStatusOf(m.versionStatus)}`) }}
        </span>
      </div>
      <div class="flex flex-row items-center gap-2 flex-wrap opacity-80">
        <span>{{ t('uploader') }}</span>
        <router-link :to="`/user/${m.uploaderId}`" class="link">{{ m.uploaderName }}</router-link>
        <template v-for="c in m.collaborators" :key="c.userId">
          <router-link :to="`/user/${c.userId}`" class="link opacity-70">{{ c.userName }}</router-link>
        </template>
      </div>
    </div>
  </div>
</template>
