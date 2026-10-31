import init, { estimate_auto_offset } from './wasm/prpr_auto_offset_wasm.js';
import type { NoteKind } from './chart';

export type { NoteKind };

export type NoteEvent = {
  /** Chart time in seconds. */
  time: number;
  kind: NoteKind;
};

export type CorrelationCurve = {
  /** Absolute offsets in seconds, ascending. */
  offsets: Float64Array;
  /** Normalized correlation in [0, 1] at each offset. */
  values: Float32Array;
};

export type EstimateOutcome = {
  /** Absolute recommended delay in seconds. */
  offset: number;
  /** Normalized correlation at the recommended delay. */
  correlation: number;
  reliable: boolean;
  curve: CorrelationCurve;
};

export type EstimateInput = {
  pcm: Float32Array;
  sampleRate: number;
  notes: NoteEvent[];
  /** The chart's declared delay; the search window is centred on it. */
  centerSec: number;
  /** Half-width of the searched offset range, in seconds. */
  rangeSec: number;
};

const NOTE_KIND_CODE: Record<NoteKind, number> = { tap: 0, hold: 1, flick: 2, drag: 3 };

let initPromise: Promise<unknown> | undefined;

/** Initialise the WASM module once per worker. */
export function initAutoOffset(): Promise<unknown> {
  return (initPromise ??= init());
}

/** Run the one-call alignment estimate on mono PCM. */
export function estimateAutoOffset(input: EstimateInput): EstimateOutcome {
  if (input.sampleRate <= 0 || input.pcm.length === 0) throw new Error('empty audio');
  if (!input.notes.length) throw new Error('empty notes');
  const raw = estimate_auto_offset({
    pcm: input.pcm,
    sampleRate: input.sampleRate,
    frontend: 2, // superflux
    windowSize: 0,
    hopSize: 0,
    noteMethod: 1, // weighted Gaussian
    noteSigma: 0.02,
    noteEvents: input.notes.map((note) => ({ time: note.time, kind: NOTE_KIND_CODE[note.kind] })),
    alignConfig: {
      searchCenterSec: input.centerSec,
      searchRangeSec: input.rangeSec,
      samplingIntervalSec: 0.005,
    },
  });
  try {
    return {
      offset: raw.offset,
      correlation: raw.correlation,
      reliable: raw.reliable,
      curve: { offsets: raw.curve_offsets(), values: raw.curve_values() },
    };
  } finally {
    raw.free();
  }
}
