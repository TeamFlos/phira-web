#!/usr/bin/env node
/**
 * Executable check for the review-card auto-offset verdict logic.
 *
 * `verdict.ts` is pure TypeScript with no runtime imports, so it is
 * transpiled in-memory and imported directly. This keeps the verification
 * dependency-free (TypeScript is already a dev dependency) and exercises the
 * exact module the UI imports.
 *
 * Run with `pnpm verify:offset`.
 */
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

const sourcePath = fileURLToPath(new URL('../src/review/auto-offset/verdict.ts', import.meta.url));
const { outputText } = ts.transpileModule(readFileSync(sourcePath, 'utf8'), {
  fileName: sourcePath,
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const verdictModule = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const { OFFSET_CORRELATION_THRESHOLD, formatDelayMs, judgeOffset, scoreAtOffset } = verdictModule;

function curve(offsets, values) {
  return { offsets: Float64Array.from(offsets), values: Float32Array.from(values) };
}

function scenario(name, run) {
  run();
  console.log(`ok - ${name}`);
}

scenario('threshold is 0.6', () => {
  assert.equal(OFFSET_CORRELATION_THRESHOLD, 0.6);
});

scenario('aligned: both the current and recommended delay pass', () => {
  const result = judgeOffset({
    curve: curve([-0.1, 0, 0.1], [0.2, 0.8, 0.3]),
    recommendedOffset: 0,
    recommendedScore: 0.8,
    currentOffset: 0,
  });
  assert.equal(result.kind, 'aligned');
  assert.equal(result.currentScore.toFixed(3), '0.800');
});

scenario('rejectable: a better delay passes while the current one does not', () => {
  const result = judgeOffset({
    curve: curve([-0.1, 0, 0.1], [0.2, 0.3, 0.85]),
    recommendedOffset: 0.1,
    recommendedScore: 0.85,
    currentOffset: 0,
  });
  assert.equal(result.kind, 'misaligned');
  assert.equal(result.currentScore.toFixed(3), '0.300');
  assert.equal(formatDelayMs(result.recommendedOffset), '+100.0');
  assert.equal(formatDelayMs(result.currentOffset), '0.0');
});

scenario('unreliable: even the best delay stays below the threshold', () => {
  const result = judgeOffset({
    curve: curve([-0.1, 0, 0.1], [0.2, 0.3, 0.5]),
    recommendedOffset: 0.1,
    recommendedScore: 0.5,
    currentOffset: 0,
  });
  assert.equal(result.kind, 'unreliable');
});

scenario('scores are interpolated between curve samples', () => {
  const sample = scoreAtOffset(curve([0, 0.1], [0.4, 0.8]), 0.05);
  assert.ok(Math.abs(sample - 0.6) < 1e-6, `expected 0.6, got ${sample}`);
});

scenario('threshold equality counts as passing', () => {
  const result = judgeOffset({
    curve: curve([0, 0.1], [0.6, 0.9]),
    recommendedOffset: 0.1,
    recommendedScore: 0.9,
    currentOffset: 0,
  });
  assert.equal(result.kind, 'aligned');
});

console.log('all offset verdict checks passed');
