<i18n>
en:
  title: Copyright check
  matched-tracks: Matched tracks
  matched-artists: Matched artists
  aliases: 'Aliases:'
  note: 'Note:'
  reason: 'Reason:'
  inherits-from: Inherits from {name}
  independent: Independent track
  no-match: No policy entry matches this track or artist.
  forbidden-hint: A forbidden entry matched. Reject this version unless there is an explicit exemption.
  restricted-hint: A restricted entry matched. Verify the conditions in the note before approving.
  retry: Retry

zh-CN:
  title: 版权检查
  matched-tracks: 匹配的曲目
  matched-artists: 匹配的艺人
  aliases: 别名：
  note: 备注：
  reason: 原因：
  inherits-from: 继承自 {name}
  independent: 独立曲目
  no-match: 没有匹配到相关政策条目。
  forbidden-hint: 命中了禁止条目。除非有明确豁免，否则应拒绝该版本。
  restricted-hint: 命中了受限条目。通过前请确认备注中的条件。
  retry: 重试
</i18n>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useApi } from '../api/client';
import type { ReviewCheckR } from '../model';
import { effectiveTrackStatus, policyBadgeClass, policyStatusIcon } from '../policy';

const { t } = useI18n();
const api = useApi();

const props = defineProps<{ track: string; artist: string }>();

const loading = ref(true);
const errored = ref(false);
const result = ref<ReviewCheckR>();

async function check() {
  loading.value = true;
  errored.value = false;
  const { data, error } = await api.POST('/content-policy/review-check', {
    body: { track: props.track, artist: props.artist },
    toastError: true,
  });
  loading.value = false;
  if (error || !data) {
    errored.value = true;
    return;
  }
  result.value = data as ReviewCheckR;
}

// The card lives outside the detail/diff tabs, so re-check whenever the
// selected version's identity changes rather than remounting it.
watch(() => [props.track, props.artist] as const, check, { immediate: true });
</script>

<template>
  <div class="card bg-base-100 border border-base-300 shadow-lg p-4 flex flex-col gap-3">
    <h2 class="font-bold text-lg flex flex-row items-center gap-2 flex-wrap">
      <span>
        <i class="fa-solid fa-scale-balanced opacity-60"></i>
        {{ t('title') }}
      </span>
      <span v-if="result" class="badge" :class="policyBadgeClass(result.compositeStatus)">
        <i class="fa-solid mr-1" :class="policyStatusIcon(result.compositeStatus)"></i>
        {{ t(`policy-status.${result.compositeStatus}`) }}
      </span>
      <span v-if="loading" class="loading loading-spinner loading-sm"></span>
      <button v-else-if="errored" class="btn btn-ghost btn-xs" @click="check">{{ t('retry') }}</button>
    </h2>

    <template v-if="result">
      <div v-if="result.compositeStatus === 'forbidden'" class="alert alert-error text-sm py-2">
        <i class="fa-solid fa-ban"></i>
        <span>{{ t('forbidden-hint') }}</span>
      </div>
      <div v-else-if="result.compositeStatus === 'restricted'" class="alert alert-warning text-sm py-2">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <span>{{ t('restricted-hint') }}</span>
      </div>
      <p v-if="!result.tracks.length && !result.artists.length" class="italic opacity-60 text-sm">{{ t('no-match') }}</p>

      <div v-if="result.tracks.length" class="flex flex-col gap-2">
        <h3 class="text-xs font-bold tracking-wider opacity-50">{{ t('matched-tracks') }}</h3>
        <div v-for="track in result.tracks" :key="track.id" class="border border-base-300 rounded-lg p-2 flex flex-col gap-1 text-sm">
          <div class="flex flex-row items-center gap-2 flex-wrap">
            <span class="font-bold">{{ track.name }}</span>
            <span class="opacity-70">— {{ track.artist }}</span>
            <span class="badge badge-sm" :class="policyBadgeClass(effectiveTrackStatus(track))">
              {{ t(`policy-status.${effectiveTrackStatus(track)}`) }}
            </span>
          </div>
          <p v-if="track.note" class="opacity-80">{{ t('note') }}{{ track.note }}</p>
          <p v-if="track.rhName" class="opacity-60">{{ t('inherits-from', { name: track.rhName }) }}</p>
        </div>
      </div>

      <div v-if="result.artists.length" class="flex flex-col gap-2">
        <h3 class="text-xs font-bold tracking-wider opacity-50">{{ t('matched-artists') }}</h3>
        <div v-for="artist in result.artists" :key="artist.id" class="border border-base-300 rounded-lg p-2 flex flex-col gap-1 text-sm">
          <div class="flex flex-row items-center gap-2 flex-wrap">
            <span class="font-bold">{{ artist.name }}</span>
            <span class="badge badge-sm" :class="policyBadgeClass(artist.status)">
              {{ t(`policy-status.${artist.status}`) }}
            </span>
          </div>
          <p v-if="artist.aliases?.length" class="opacity-80">{{ t('aliases') }}{{ artist.aliases.join(' / ') }}</p>
          <p v-if="artist.reason" class="opacity-80">{{ t('reason') }}{{ artist.reason }}</p>
          <p v-if="artist.note" class="opacity-80">{{ t('note') }}{{ artist.note }}</p>
        </div>
      </div>
    </template>
  </div>
</template>
