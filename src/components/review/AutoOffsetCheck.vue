<i18n>
en:
  auto-offset-title: Delay alignment
  auto-offset-run: Check audio sync
  auto-offset-rerun: Re-check
  auto-offset-running: Analysing the audio…
  auto-offset-hint: Downloads this version's package and correlates its audio with the chart notes.
  auto-offset-current: Current delay
  auto-offset-recommended: Recommended delay
  auto-offset-current-score: Current correlation
  auto-offset-recommended-score: Recommended correlation
  auto-offset-threshold: Pass threshold {value}
  auto-offset-offset-missing: No offset is declared in info.yml; 0 ms is assumed.
  auto-offset-package: '{format} · {count} notes'
  auto-offset-verdict-aligned: The chart is already aligned with the audio.
  auto-offset-verdict-misaligned: A better delay was found; the chart can be rejected.
  auto-offset-verdict-unreliable: The audio and chart could not be matched reliably.
  auto-offset-applied: The rejection message has been filled in below — review it before voting.
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
  auto-offset-current: 当前延迟
  auto-offset-recommended: 推荐延迟
  auto-offset-current-score: 当前相关系数
  auto-offset-recommended-score: 推荐相关系数
  auto-offset-threshold: 判定阈值 {value}
  auto-offset-offset-missing: info.yml 未声明 offset，按 0 ms 计算。
  auto-offset-package: '{format} · {count} 个音符'
  auto-offset-verdict-aligned: 谱面与音频已对齐。
  auto-offset-verdict-misaligned: 存在更优延迟，可据此打回。
  auto-offset-verdict-unreliable: 音频与谱面无法可靠匹配。
  auto-offset-applied: 打回文案已填入下方，请在投票前确认。
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
import { onBeforeUnmount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { ChartVersion } from '../../model';
import {
  AutoOffsetError,
  estimateVersionOffset,
  formatDelayMs,
  OFFSET_CORRELATION_THRESHOLD,
} from '../../review/auto-offset';
import type { AutoOffsetResult, OffsetVerdict } from '../../review/auto-offset';

import LoadOr from '../LoadOr.vue';
import OffsetCurve from './OffsetCurve.vue';

const props = defineProps<{ version: ChartVersion }>();
const emit = defineEmits<{ (e: 'verdict', verdict: OffsetVerdict): void }>();

const { t } = useI18n();

const running = ref(false);
const error = ref<string>();
const result = ref<AutoOffsetResult>();

let runId = 0;
let controller: AbortController | undefined;

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

function errorText(failure: unknown): string {
  if (failure instanceof AutoOffsetError) {
    const base = t(`auto-offset-error-${failure.code}`);
    return failure.message && failure.message !== failure.code ? `${base} (${failure.message})` : base;
  }
  return t('auto-offset-error-unknown', { detail: failure instanceof Error ? failure.message : String(failure) });
}

function reset() {
  runId++;
  controller?.abort();
  controller = undefined;
  running.value = false;
  error.value = undefined;
  result.value = undefined;
}

watch(() => props.version.id, reset);
onBeforeUnmount(reset);

async function run() {
  const id = ++runId;
  controller?.abort();
  const local = new AbortController();
  controller = local;
  running.value = true;
  error.value = undefined;
  result.value = undefined;
  try {
    const outcome = await estimateVersionOffset(props.version, local.signal);
    if (id !== runId) return;
    result.value = outcome;
    emit('verdict', outcome.verdict);
  } catch (failure) {
    if (id !== runId || local.signal.aborted) return;
    error.value = errorText(failure);
  } finally {
    if (id === runId) running.value = false;
  }
}
</script>

<template>
  <section class="flex flex-col gap-2">
    <div class="flex items-center gap-2 flex-wrap">
      <h3 class="text-xs font-bold tracking-wider opacity-50" v-t="'auto-offset-title'"></h3>
      <span class="grow"></span>
      <button type="button" class="btn btn-sm btn-outline" :disabled="running" @click="run">
        <LoadOr :loading="running">{{ t(result ? 'auto-offset-rerun' : 'auto-offset-run') }}</LoadOr>
      </button>
    </div>
    <p class="text-xs opacity-60" v-t="'auto-offset-hint'"></p>

    <div v-if="error" class="alert alert-error text-sm py-2">
      <i class="fa-solid fa-circle-exclamation"></i>
      <span>{{ error }}</span>
    </div>

    <template v-else-if="result">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div class="rounded-lg bg-base-200 px-3 py-2 flex flex-col min-w-0">
          <span class="text-xs opacity-50" v-t="'auto-offset-current'"></span>
          <span class="font-mono font-medium">{{ formatDelayMs(result.currentOffset) }} ms</span>
        </div>
        <div class="rounded-lg bg-base-200 px-3 py-2 flex flex-col min-w-0">
          <span class="text-xs opacity-50" v-t="'auto-offset-current-score'"></span>
          <span class="font-mono font-medium">{{ result.verdict.currentScore.toFixed(3) }}</span>
        </div>
        <div class="rounded-lg bg-base-200 px-3 py-2 flex flex-col min-w-0">
          <span class="text-xs opacity-50" v-t="'auto-offset-recommended'"></span>
          <span class="font-mono font-medium">{{ formatDelayMs(result.estimate.offset) }} ms</span>
        </div>
        <div class="rounded-lg bg-base-200 px-3 py-2 flex flex-col min-w-0">
          <span class="text-xs opacity-50" v-t="'auto-offset-recommended-score'"></span>
          <span class="font-mono font-medium">{{ result.estimate.correlation.toFixed(3) }}</span>
        </div>
      </div>

      <div class="rounded-lg border border-base-300 p-2">
        <OffsetCurve
          :offsets="result.estimate.curve.offsets"
          :values="result.estimate.curve.values"
          :recommendedOffset="result.estimate.offset"
          :recommendedScore="result.estimate.correlation"
          :currentOffset="result.currentOffset"
          :threshold="OFFSET_CORRELATION_THRESHOLD" />
      </div>

      <div class="flex flex-row gap-x-4 gap-y-1 flex-wrap text-xs opacity-60">
        <span>{{ t('auto-offset-threshold', { value: OFFSET_CORRELATION_THRESHOLD.toFixed(2) }) }}</span>
        <span>{{ t('auto-offset-package', { format: result.format.toUpperCase(), count: result.noteCount }) }}</span>
        <span v-if="result.infoOffset === null" v-t="'auto-offset-offset-missing'"></span>
      </div>

      <div class="alert text-sm py-2" :class="verdictClass[result.verdict.kind]" role="status" aria-live="polite">
        <i class="fa-solid" :class="verdictIcon[result.verdict.kind]"></i>
        <span>{{ t(`auto-offset-verdict-${result.verdict.kind}`) }}</span>
      </div>
      <p v-if="result.verdict.kind !== 'aligned'" class="text-xs opacity-60" v-t="'auto-offset-applied'"></p>
    </template>
  </section>
</template>
