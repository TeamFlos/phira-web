import type { EstimateOutcome, NoteEvent } from './engine';

export type WorkerRequest = {
  id: number;
  pcm: Float32Array;
  sampleRate: number;
  notes: NoteEvent[];
  centerSec: number;
  rangeSec: number;
};

export type WorkerResponse =
  | { type: 'result'; id: number; result: EstimateOutcome }
  | { type: 'error'; id: number; message: string };
