<i18n>
en:
  current-label: Current
  recommended-label: Recommended
  threshold-label: Threshold
  aria: 'Correlation curve: recommended delay {recommended} ms, current delay {current} ms.'
zh-CN:
  current-label: 当前
  recommended-label: 推荐
  threshold-label: 阈值
  aria: '相关系数曲线：推荐延迟 {recommended} ms，当前延迟 {current} ms。'
</i18n>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { formatDelayMs } from '../../review/auto-offset';

const props = defineProps<{
  offsets: Float64Array;
  values: Float32Array;
  recommendedOffset: number;
  recommendedScore: number;
  currentOffset: number;
  threshold: number;
}>();

const { t } = useI18n();
const canvas = ref<HTMLCanvasElement>();

const PAD = { left: 40, right: 14, top: 20, bottom: 26 };

let frame = 0;
let resizeObserver: ResizeObserver | undefined;
let themeObserver: MutationObserver | undefined;

const ariaLabel = computed(() =>
  t('aria', {
    recommended: formatDelayMs(props.recommendedOffset),
    current: formatDelayMs(props.currentOffset),
  }),
);

function withAlpha(color: string, alpha: number): string {
  return color ? `hsl(${color} / ${alpha})` : `rgba(120, 120, 120, ${alpha})`;
}

function cssColor(color: string, fallback: string): string {
  return color ? `hsl(${color})` : fallback;
}

function readPalette(el: HTMLElement) {
  const style = getComputedStyle(el);
  const primary = style.getPropertyValue('--p').trim();
  const error = style.getPropertyValue('--er').trim();
  const base = style.getPropertyValue('--bc').trim();
  const line = style.getPropertyValue('--b3').trim();
  return {
    text: style.color || '#334155',
    primary,
    error,
    base,
    line,
    primarySolid: cssColor(primary, '#6366f1'),
    errorSolid: cssColor(error, '#dc2626'),
    baseSolid: cssColor(base, '#64748b'),
    lineSolid: cssColor(line, '#cbd5e1'),
    primaryAlpha: (alpha: number) => withAlpha(primary, alpha),
    errorAlpha: (alpha: number) => withAlpha(error, alpha),
    baseAlpha: (alpha: number) => withAlpha(base, alpha),
    lineAlpha: (alpha: number) => withAlpha(line, alpha),
  };
}

function niceStep(spanMs: number): number {
  if (spanMs <= 80) return 10;
  if (spanMs <= 200) return 25;
  if (spanMs <= 600) return 50;
  if (spanMs <= 1500) return 100;
  return 250;
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}

function chip(ctx: CanvasRenderingContext2D, canvasWidth: number, x: number, y: number, text: string, color: string, background: string) {
  ctx.font = '10px ui-sans-serif, system-ui, sans-serif';
  const textWidth = ctx.measureText(text).width;
  const width = textWidth + 12;
  const height = 16;
  const left = clamp(x - width / 2, PAD.left, canvasWidth - PAD.right - width);
  ctx.beginPath();
  ctx.roundRect(left, y, width, height, 8);
  ctx.fillStyle = background;
  ctx.fill();
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, left + width / 2, y + height / 2);
}

function draw() {
  const el = canvas.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const pixelWidth = Math.round(rect.width * dpr);
  const pixelHeight = Math.round(rect.height * dpr);
  if (el.width !== pixelWidth || el.height !== pixelHeight) {
    el.width = pixelWidth;
    el.height = pixelHeight;
  }
  const ctx = el.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const width = rect.width;
  const height = rect.height;
  ctx.clearRect(0, 0, width, height);

  const { offsets, values } = props;
  const count = Math.min(offsets.length, values.length);
  if (count < 2) return;
  const palette = readPalette(el);
  const plotWidth = Math.max(1, width - PAD.left - PAD.right);
  const plotHeight = Math.max(1, height - PAD.top - PAD.bottom);
  const bottom = PAD.top + plotHeight;
  const minOffset = offsets[0];
  const maxOffset = offsets[count - 1];
  const span = Math.max(1e-6, maxOffset - minOffset);
  const xOf = (offset: number) => PAD.left + ((offset - minOffset) / span) * plotWidth;

  let peak = 0;
  for (let i = 0; i < count; i++) peak = Math.max(peak, values[i]);
  const scoreTop = Math.min(1, Math.max(0.7, peak * 1.12));
  const yOf = (score: number) => PAD.top + (1 - clamp(score / scoreTop, 0, 1)) * plotHeight;

  // horizontal score grid
  ctx.save();
  ctx.font = '10px ui-sans-serif, system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (const score of [0, 0.25, 0.5, 0.75, 1]) {
    if (score > scoreTop + 1e-9) continue;
    const y = yOf(score);
    ctx.strokeStyle = palette.lineAlpha(score === 0 ? 0.9 : 0.45);
    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(PAD.left + plotWidth, y);
    ctx.stroke();
    ctx.fillStyle = palette.baseAlpha(0.75);
    ctx.fillText(score.toFixed(2), PAD.left - 6, y);
  }
  ctx.restore();

  // vertical offset grid
  const spanMs = span * 1000;
  const step = niceStep(spanMs);
  const minMs = minOffset * 1000;
  const maxMs = maxOffset * 1000;
  const startTick = Math.ceil(minMs / step) * step;
  const endTick = Math.floor(maxMs / step) * step;
  const labelEvery = spanMs / step > 8 ? 2 : 1;
  ctx.save();
  ctx.font = '10px ui-sans-serif, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let tick = startTick; tick <= endTick + 1e-6; tick += step) {
    const x = xOf(tick / 1000);
    const major = Math.round(tick / step) % labelEvery === 0;
    ctx.strokeStyle = palette.lineAlpha(major ? 0.9 : 0.45);
    ctx.beginPath();
    ctx.moveTo(x, PAD.top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
    if (major) {
      ctx.fillStyle = palette.baseAlpha(0.75);
      ctx.fillText(tick === 0 ? '0' : `${tick > 0 ? '+' : ''}${tick}`, x, height - PAD.bottom / 2 + 4);
    }
  }
  ctx.restore();

  // threshold line
  if (props.threshold <= scoreTop + 1e-9) {
    const y = yOf(props.threshold);
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = palette.errorAlpha(0.55);
    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(PAD.left + plotWidth, y);
    ctx.stroke();
    ctx.font = '10px ui-sans-serif, system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = palette.errorAlpha(0.8);
    ctx.fillText(`${t('threshold-label')} ${props.threshold.toFixed(2)}`, PAD.left + plotWidth, y - 4);
    ctx.restore();
  }

  // correlation curve
  const area = ctx.createLinearGradient(0, PAD.top, 0, bottom);
  area.addColorStop(0, palette.primaryAlpha(0.24));
  area.addColorStop(1, palette.primaryAlpha(0.01));
  ctx.beginPath();
  ctx.moveTo(xOf(offsets[0]), bottom);
  for (let i = 0; i < count; i++) ctx.lineTo(xOf(offsets[i]), yOf(values[i]));
  ctx.lineTo(xOf(offsets[count - 1]), bottom);
  ctx.closePath();
  ctx.fillStyle = area;
  ctx.fill();

  ctx.save();
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = palette.primarySolid;
  ctx.beginPath();
  for (let i = 0; i < count; i++) {
    const x = xOf(offsets[i]);
    const y = yOf(values[i]);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();

  // current delay marker
  const currentX = xOf(props.currentOffset);
  if (currentX >= PAD.left - 1 && currentX <= PAD.left + plotWidth + 1) {
    ctx.save();
    ctx.setLineDash([2, 4]);
    ctx.strokeStyle = palette.baseAlpha(0.55);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(currentX, PAD.top);
    ctx.lineTo(currentX, bottom);
    ctx.stroke();
    ctx.restore();
    chip(ctx, width, currentX, bottom - 19, t('current-label'), palette.baseSolid, palette.baseAlpha(0.1));
  }

  // recommended delay marker
  const recommendedX = xOf(props.recommendedOffset);
  if (recommendedX >= PAD.left - 1 && recommendedX <= PAD.left + plotWidth + 1) {
    ctx.save();
    ctx.strokeStyle = palette.primaryAlpha(0.85);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(recommendedX, PAD.top);
    ctx.lineTo(recommendedX, bottom);
    ctx.stroke();
    ctx.fillStyle = palette.primarySolid;
    ctx.beginPath();
    ctx.arc(recommendedX, yOf(props.recommendedScore), 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    chip(ctx, width, recommendedX, PAD.top - 3, t('recommended-label'), palette.primarySolid, palette.primaryAlpha(0.12));
  }
}

function scheduleDraw() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    draw();
  });
}

watch(() => [props.offsets, props.values, props.recommendedOffset, props.recommendedScore, props.currentOffset, props.threshold], scheduleDraw);

onMounted(() => {
  const el = canvas.value;
  if (!el) return;
  resizeObserver = new ResizeObserver(scheduleDraw);
  resizeObserver.observe(el);
  themeObserver = new MutationObserver(scheduleDraw);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
  scheduleDraw();
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  themeObserver?.disconnect();
  if (frame) cancelAnimationFrame(frame);
});
</script>

<template>
  <canvas ref="canvas" class="w-full h-48" role="img" :aria-label="ariaLabel"></canvas>
</template>
