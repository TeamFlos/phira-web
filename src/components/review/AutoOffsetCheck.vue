<i18n>
en:
  auto-offset-title: Delay alignment
  auto-offset-run: Check audio sync
  auto-offset-rerun: Re-check
  auto-offset-running: Analysing the audio…
  auto-offset-hint: Downloads this version's package and correlates its audio with the chart notes.
  auto-offset-current: Current
  auto-offset-recommended: Recommended
  auto-offset-score: 'correlation {value}'
  auto-offset-offset-missing: No offset is declared in info.yml; 0 ms is assumed.
  auto-offset-package: '{count} notes'
  auto-offset-verdict-aligned: The chart is already aligned with the audio.
  auto-offset-verdict-misaligned: A better delay was found; the chart can be rejected.
  auto-offset-verdict-unreliable: The audio and chart could not be matched reliably.
  auto-offset-error-invalid-archive: The chart package could not be read.
  auto-offset-error-no-chart: No chart file was found in the package.
  auto-offset-error-pbc-unsupported: Binary PBC charts are not supported.
  auto-offset-error-no-notes: The chart contains no playable notes.
  auto-offset-error-no-audio: The package contains no audio track.
  auto-offset-error-download-failed: The chart package could not be downloaded.
  auto-offset-error-audio-decode: The browser could not decode the audio track.
  auto-offset-error-audio-too-large: The audio track is too large to analyse.
  auto-offset-error-audio-too-long: The audio track is too long to analyse.
  auto-offset-error-worker: Audio alignment failed.
  auto-offset-error-unknown: 'Alignment failed: {detail}'
zh-CN:
  auto-offset-title: 自动对音检测
  auto-offset-run: 检测对音
  auto-offset-rerun: 重新检测
  auto-offset-running: 正在分析音频…
  auto-offset-hint: 下载当前版本的谱面包，并将音频与谱面音符做相关性分析。
  auto-offset-current: 当前
  auto-offset-recommended: 推荐
  auto-offset-score: '匹配值 {value}'
  auto-offset-offset-missing: info.yml 未声明 offset，按 0 ms 计算。
  auto-offset-package: '{count} 个音符'
  auto-offset-verdict-aligned: 谱面与音频已对齐。
  auto-offset-verdict-misaligned: 存在更优延迟，可据此打回。
  auto-offset-verdict-unreliable: 音频与谱面无法可靠匹配。
  auto-offset-error-invalid-archive: 无法读取谱面包。
  auto-offset-error-no-chart: 谱面包中没有谱面文件。
  auto-offset-error-pbc-unsupported: 暂不支持 PBC 二进制谱面。
  auto-offset-error-no-notes: 谱面中没有可用音符。
  auto-offset-error-no-audio: 谱面包中没有音频。
  auto-offset-error-download-failed: 谱面包下载失败。
  auto-offset-error-audio-decode: 浏览器无法解码该音频。
  auto-offset-error-audio-too-large: 音频文件过大，无法分析。
  auto-offset-error-audio-too-long: 音频过长，无法分析。
  auto-offset-error-worker: 对音分析失败。
  auto-offset-error-unknown: '对音检测失败：{detail}'
</i18n>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { AutoOffsetError, formatDelayMs, OFFSET_CORRELATION_THRESHOLD } from '../../review/auto-offset';
import type { AutoOffsetResult, OffsetVerdict } from '../../review/auto-offset';

import LoadOr from '../LoadOr.vue';
import OffsetCurve from './OffsetCurve.vue';

const props = defineProps<{
  running: boolean;
  result?: AutoOffsetResult;
  failure?: unknown;
}>();

const emit = defineEmits<{ (e: 'run'): void }>();

const { t } = useI18n();

const verdictClass: Record<OffsetVerdict['kind'], string> = {
  aligned: 'alert-success',
  misaligned: 'alert-warning',
  unreliable: 'alert-error',
};

const verdictIcon: Record<OffsetVerdict['kind'], string> = {
  aligned: 'fa-circle-check',
  misaligned: 'fa-triangle-exclamation',
  unreliable: 'fa-circle-xmark',
};

const error = computed(() => {
  const failure = props.failure;
  if (!failure) return undefined;
  if (failure instanceof AutoOffsetError) {
    const base = t(`auto-offset-error-${failure.code}`);
    return failure.message && failure.message !== failure.code ? `${base} (${failure.message})` : base;
  }
  return t('auto-offset-error-unknown', { detail: failure instanceof Error ? failure.message : String(failure) });
});
</script>

<template>
  <section class="flex flex-col gap-2">
    <div class="flex items-center gap-2 flex-wrap">
      <h3 class="text-xs font-bold tracking-wider opacity-50" v-t="'auto-offset-title'"></h3>
      <span class="grow"></span>
      <button type="button" class="btn btn-sm btn-outline" :disabled="running" @click="emit('run')">
        <LoadOr :loading="running">{{ t(result ? 'auto-offset-rerun' : 'auto-offset-run') }}</LoadOr>
      </button>
    </div>
    <p v-if="running && !result" class="text-xs opacity-60" v-t="'auto-offset-hint'"></p>

    <div v-if="error" class="alert alert-error text-sm py-2">
      <i class="fa-solid fa-circle-exclamation"></i>
      <span>{{ error }}</span>
    </div>

    <template v-else-if="result">
      <div class="grid grid-cols-2 gap-2">
        <div class="rounded-lg bg-base-200 px-3 py-2 flex flex-col min-w-0">
          <span class="text-xs opacity-50" v-t="'auto-offset-current'"></span>
          <span class="font-mono font-medium">
            {{ formatDelayMs(result.currentOffset) }} ms
            <span class="text-xs opacity-60">({{ t('auto-offset-score', { value: result.verdict.currentScore.toFixed(3) }) }})</span>
          </span>
        </div>
        <div class="rounded-lg bg-base-200 px-3 py-2 flex flex-col min-w-0">
          <span class="text-xs opacity-50" v-t="'auto-offset-recommended'"></span>
          <span class="font-mono font-medium">
            {{ formatDelayMs(result.estimate.offset) }} ms
            <span class="text-xs opacity-60">({{ t('auto-offset-score', { value: result.estimate.correlation.toFixed(3) }) }})</span>
          </span>
        </div>
      </div>

      <div class="rounded-lg border border-base-300 p-2">
        <OffsetCurve
          :offsets="result.estimate.curve.offsets"
          :values="result.estimate.curve.values"
          :recommendedOffset="result.estimate.offset"
          :recommendedScore="result.estimate.correlation"
          :currentOffset="result.currentOffset"
          :threshold="OFFSET_CORRELATION_THRESHOLD"
          :referenceThreshold="0.6" />
      </div>

      <div class="flex flex-row gap-x-4 gap-y-1 flex-wrap text-xs opacity-60">
        <span>{{ t('auto-offset-package', { count: result.noteCount }) }}</span>
        <span v-if="result.infoOffset === null" v-t="'auto-offset-offset-missing'"></span>
      </div>

      <div class="alert text-sm py-2" :class="verdictClass[result.verdict.kind]" role="status" aria-live="polite">
        <i class="fa-solid" :class="verdictIcon[result.verdict.kind]"></i>
        <span>{{ t(`auto-offset-verdict-${result.verdict.kind}`) }}</span>
      </div>
    </template>
  </section>
</template>
