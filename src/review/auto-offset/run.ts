import { fileToURL } from '../../common';
import type { ChartVersion } from '../../model';

import { decodeMonoPcm } from './audio';
import { parsePez } from './chart';
import type { ParsedPez } from './chart';
import { AutoOffsetError } from './errors';
import type { EstimateOutcome } from './engine';
import type { WorkerRequest, WorkerResponse } from './protocol';
import { judgeOffset } from './verdict';
import type { OffsetVerdict } from './verdict';

/** Search the declared delay up to half a second in either direction. */
export const OFFSET_SEARCH_RANGE_SEC = 0.5;

export type AutoOffsetResult = {
  estimate: EstimateOutcome;
  verdict: OffsetVerdict;
  /** `info.yml` offset, or zero when the version does not declare one. */
  currentOffset: number;
  infoOffset: number | null;
  format: ParsedPez['format'];
  noteCount: number;
};

type Pending = {
  resolve: (result: EstimateOutcome) => void;
  reject: (error: Error) => void;
};

let worker: Worker | undefined;
let nextId = 0;
const pending = new Map<number, Pending>();

function failPending(message: string) {
  const error = new AutoOffsetError('worker', message);
  for (const request of pending.values()) request.reject(error);
  pending.clear();
  worker?.terminate();
  worker = undefined;
}

function getWorker(): Worker {
  if (worker) return worker;
  const instance = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  instance.addEventListener('message', (event) => {
    const data = event.data as WorkerResponse;
    const request = pending.get(data.id);
    if (!request) return;
    pending.delete(data.id);
    if (data.type === 'result') request.resolve(data.result);
    else request.reject(new AutoOffsetError('worker', data.message));
  });
  instance.addEventListener('error', (event) => failPending(event.message));
  instance.addEventListener('messageerror', () => failPending('worker message could not be deserialized'));
  worker = instance;
  return instance;
}

function runInWorker(input: Omit<WorkerRequest, 'id'>): Promise<EstimateOutcome> {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    const buffer = input.pcm.buffer;
    try {
      getWorker().postMessage({ ...input, id }, buffer instanceof ArrayBuffer ? [buffer] : []);
    } catch (error) {
      pending.delete(id);
      reject(new AutoOffsetError('worker', error instanceof Error ? error.message : String(error)));
    }
  });
}

function throwIfAborted(signal: AbortSignal | undefined) {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
}

/**
 * Download a review version's `.pez`, decode its audio, and estimate the
 * delay that best aligns the audio with the chart's notes.
 */
export async function estimateVersionOffset(version: ChartVersion, signal?: AbortSignal): Promise<AutoOffsetResult> {
  throwIfAborted(signal);
  let response: Response;
  try {
    response = await fetch(fileToURL(version.content.file), { signal });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new AutoOffsetError('download-failed', error instanceof Error ? error.message : String(error));
  }
  if (!response.ok) throw new AutoOffsetError('download-failed', `HTTP ${response.status}`);
  const buffer = await response.arrayBuffer();
  throwIfAborted(signal);

  let parsed: ParsedPez;
  try {
    parsed = await parsePez(buffer);
  } catch (error) {
    throw error instanceof AutoOffsetError ? error : new AutoOffsetError('invalid-archive', error instanceof Error ? error.message : String(error));
  }
  if (!parsed.audio) throw new AutoOffsetError('no-audio');
  const notes = parsed.notes.filter((note) => !note.fake).map(({ time, kind }) => ({ time, kind }));
  if (!notes.length) throw new AutoOffsetError('no-notes');

  const currentOffset = parsed.infoOffset ?? 0;
  const { pcm, sampleRate } = await decodeMonoPcm(parsed.audio.data);
  throwIfAborted(signal);
  const estimate = await runInWorker({
    pcm,
    sampleRate,
    notes,
    centerSec: currentOffset,
    rangeSec: OFFSET_SEARCH_RANGE_SEC,
  });
  throwIfAborted(signal);
  const verdict = judgeOffset({
    curve: estimate.curve,
    recommendedOffset: estimate.offset,
    recommendedScore: estimate.correlation,
    currentOffset,
  });
  return { estimate, verdict, currentOffset, infoOffset: parsed.infoOffset, format: parsed.format, noteCount: notes.length };
}
