import { estimateAutoOffset, initAutoOffset } from './engine';
import type { WorkerRequest, WorkerResponse } from './protocol';

// The DOM lib types `self` as Window; inside a module worker it is a
// DedicatedWorkerGlobalScope whose postMessage takes a transfer list instead
// of a target origin. Bind the receiver explicitly: detached Web API methods
// throw when called with an undefined `this`.
const postToMain = (self.postMessage as unknown as (message: WorkerResponse) => void).bind(self);

self.onmessage = async (event) => {
  const data: WorkerRequest = event.data;
  try {
    await initAutoOffset();
    const result = estimateAutoOffset({
      pcm: data.pcm,
      sampleRate: data.sampleRate,
      notes: data.notes,
      centerSec: data.centerSec,
      rangeSec: data.rangeSec,
    });
    postToMain({ type: 'result', id: data.id, result });
  } catch (error) {
    postToMain({ type: 'error', id: data.id, message: error instanceof Error ? error.message : String(error) });
  }
};
