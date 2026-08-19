<i18n>
en:
  forbidden-hint: A forbidden policy entry matched. Reject unless there is an explicit exemption.
  restricted-hint: A restricted policy entry matched. Verify the conditions in the note before approving.
  unavailable-track: Track name is blank — track copyright could not be checked.
  unavailable-artist: Composer is blank — artist copyright could not be checked.
  matched-tracks: Matched tracks
  matched-artists: Matched artists
  aliases: 'Aliases:'
  note: 'Note:'
  reason: 'Reason:'
  inherits-from: Inherits from {name}

zh-CN:
  forbidden-hint: 命中了禁止条目。除非有明确豁免，否则应拒绝该版本。
  restricted-hint: 命中了受限条目。通过前请确认备注中的条件。
  unavailable-track: 曲名为空，无法检索曲目版权信息。
  unavailable-artist: 曲师为空，无法检索艺人版权信息。
  matched-tracks: 匹配的曲目
  matched-artists: 匹配的艺人
  aliases: 别名：
  note: 备注：
  reason: 原因：
  inherits-from: 继承自 {name}
</i18n>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { ReviewCheckR } from '../../model';
import { effectiveTrackStatus, policyBadgeClass } from '../../policy';
import { copyrightProblem } from '../../review';

const { t } = useI18n();

const props = defineProps<{ result?: ReviewCheckR; suppressed?: ('track' | 'artist')[] }>();

const problem = computed(() => copyrightProblem(props.result));
</script>

<template>
  <p v-for="side in suppressed ?? []" :key="side" class="flex items-center gap-1 text-sm text-warning">
    <i class="fa-solid fa-triangle-exclamation shrink-0"></i>
    {{ t(`unavailable-${side}`) }}
  </p>

  <template v-if="result">
    <div v-if="problem === 'forbidden'" class="alert alert-error text-sm py-2">
      <i class="fa-solid fa-ban"></i>
      <span>{{ t('forbidden-hint') }}</span>
    </div>
    <div v-else-if="problem === 'restricted'" class="alert alert-warning text-sm py-2">
      <i class="fa-solid fa-triangle-exclamation"></i>
      <span>{{ t('restricted-hint') }}</span>
    </div>

    <div v-if="result.tracks.length" class="flex flex-col gap-1">
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

    <div v-if="result.artists.length" class="flex flex-col gap-1">
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
</template>
