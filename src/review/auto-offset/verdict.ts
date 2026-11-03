import type { CorrelationCurve } from './engine';

/**
 * A chart is considered aligned at a delay when the normalized cross
 * correlation reaches this threshold. The same value decides whether an
 * estimated offset is trustworthy enough to reject with, or is itself noise.
 */
export const OFFSET_CORRELATION_THRESHOLD = 0.35;

/**
 * A delay gap above this, with a better-scoring delay on the other side, is
 * still worth rejecting even when the current delay itself passes.
 */
export const OFFSET_GAP_THRESHOLD = 0.02;

export type OffsetVerdictKind =
  /** The chart's declared delay already scores above the threshold. */
  | 'aligned'
  /** A different delay scores above the threshold: the chart can be rejected. */
  | 'misaligned'
  /** No delay scores above the threshold: the audio and notes do not match. */
  | 'unreliable';

export type OffsetVerdict = {
  kind: OffsetVerdictKind;
  recommendedOffset: number;
  recommendedScore: number;
  currentOffset: number;
  currentScore: number;
};

/**
 * Linear interpolation of the correlation curve at an arbitrary offset.
 * The curve is centred on the chart's current delay, so the current point is
 * normally one of its samples.
 */
export function scoreAtOffset(curve: CorrelationCurve, offsetSec: number): number {
  const { offsets, values } = curve;
  const length = Math.min(offsets.length, values.length);
  if (length === 0) return 0;
  if (offsetSec <= offsets[0]) return values[0];
  if (offsetSec >= offsets[length - 1]) return values[length - 1];
  let low = 0;
  let high = length - 1;
  while (high - low > 1) {
    const mid = (low + high) >> 1;
    if (offsets[mid] <= offsetSec) low = mid;
    else high = mid;
  }
  const span = offsets[high] - offsets[low];
  if (span <= 0) return values[low];
  const ratio = (offsetSec - offsets[low]) / span;
  return values[low] + (values[high] - values[low]) * ratio;
}

/** Apply the reject thresholds to one estimate. */
export function judgeOffset(input: { curve: CorrelationCurve; recommendedOffset: number; recommendedScore: number; currentOffset: number }): OffsetVerdict {
  const currentScore = scoreAtOffset(input.curve, input.currentOffset);
  let kind: OffsetVerdictKind;
  if (input.recommendedScore < OFFSET_CORRELATION_THRESHOLD) kind = 'unreliable';
  else if (currentScore < OFFSET_CORRELATION_THRESHOLD) kind = 'misaligned';
  else if (Math.abs(input.recommendedOffset - input.currentOffset) > OFFSET_GAP_THRESHOLD && input.recommendedScore > currentScore) kind = 'misaligned';
  else kind = 'aligned';
  return {
    kind,
    recommendedOffset: input.recommendedOffset,
    recommendedScore: input.recommendedScore,
    currentOffset: input.currentOffset,
    currentScore,
  };
}

/** Delay as a signed millisecond string, e.g. `+120.0`. */
export function formatDelayMs(seconds: number): string {
  return `${seconds > 0 ? '+' : ''}${(seconds * 1000).toFixed(1)}`;
}
