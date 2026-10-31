import { AutoOffsetError } from '../errors';
import { parsePec } from './pec';
import type { NoteKind, ParsedNote } from './pec';
import { parsePgr } from './pgr';
import { parseRpe } from './rpe';
import { unzip } from './zip';
import { parseInfoYaml } from './yaml';

export type { NoteKind, ParsedNote };
export type ChartFormat = 'pec' | 'pgr' | 'rpe' | 'pbc';

export type PezAudio = { name: string; data: Uint8Array };

export type ParsedPez = {
  format: ChartFormat;
  /** The literal `info.yml` offset in seconds, or null when it is not declared. */
  infoOffset: number | null;
  notes: ParsedNote[];
  audio: PezAudio | null;
};

function decodeText(bytes: Uint8Array): string | null {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

function pickInfo(files: Map<string, Uint8Array>): string | null {
  for (const name of [':info', 'info.yml', 'info.txt']) {
    const bytes = files.get(name);
    if (bytes) return decodeText(bytes) ?? '';
  }
  return null;
}

function pickChart(files: Map<string, Uint8Array>, info: Record<string, unknown>): { name: string; bytes: Uint8Array } | null {
  const declared = typeof info.chart === 'string' ? info.chart : 'chart.json';
  const candidates = [declared];
  if (declared.endsWith('.pec')) candidates.push(`${declared.slice(0, -4)}.json`);
  candidates.push('chart.json');
  for (const name of candidates) {
    const bytes = files.get(name);
    if (bytes) return { name, bytes };
  }
  for (const [name, bytes] of files) {
    if (/\.(json|pec)$/i.test(name) && !name.includes('info')) return { name, bytes };
  }
  return null;
}

const AUDIO_EXT = /\.(?:mp3|ogg|wav|flac|aac|m4a|opus)$/i;

function findAudio(files: Map<string, Uint8Array>, declared: unknown): PezAudio | null {
  const names: string[] = [];
  if (typeof declared === 'string' && declared.trim()) names.push(declared.trim());
  names.push('song.mp3', 'music.mp3');
  for (const name of names) {
    const normalized = name.replace(/\\/g, '/').replace(/^\.?\//, '');
    const exact = files.get(normalized);
    if (exact) return { name: normalized, data: exact };
    const lower = normalized.toLowerCase();
    for (const [key, data] of files) {
      if (key.replace(/\\/g, '/').replace(/^\.?\//, '').toLowerCase() === lower) return { name: key, data };
    }
  }
  for (const [name, data] of files) {
    if (AUDIO_EXT.test(name)) return { name, data };
  }
  return null;
}

function inferFormat(info: Record<string, unknown>, bytes: Uint8Array): ChartFormat {
  const declared = typeof info.format === 'string' ? info.format.toLowerCase() : null;
  if (declared === 'pec' || declared === 'pgr' || declared === 'rpe' || declared === 'pbc') return declared;
  const text = decodeText(bytes);
  if (text === null) return 'pbc';
  const trimmed = text.trimStart();
  if (trimmed.startsWith('{')) return text.includes('"META"') ? 'rpe' : 'pgr';
  return 'pec';
}

/**
 * Read a Phira `.pez` chart package.
 *
 * Supports PEC, Phigros JSON (PGR) and RPE JSON charts. PBC (binary) charts
 * are recognized but not decoded.
 */
export async function parsePez(buffer: ArrayBufferLike): Promise<ParsedPez> {
  let files: Map<string, Uint8Array>;
  try {
    files = await unzip(buffer);
  } catch (error) {
    throw new AutoOffsetError('invalid-archive', error instanceof Error ? error.message : String(error));
  }
  const infoText = pickInfo(files);
  const info = infoText === null ? {} : parseInfoYaml(infoText);
  const picked = pickChart(files, info);
  if (!picked) throw new AutoOffsetError('no-chart');
  const format = inferFormat(info, picked.bytes);

  let notes: ParsedNote[];
  if (format === 'pbc') {
    throw new AutoOffsetError('pbc-unsupported');
  } else if (format === 'pec') {
    notes = parsePec(decodeText(picked.bytes) ?? '').notes;
  } else if (format === 'pgr') {
    notes = parsePgr(JSON.parse(decodeText(picked.bytes) ?? '')).notes;
  } else {
    notes = parseRpe(JSON.parse(decodeText(picked.bytes) ?? '')).notes;
  }
  if (!notes.length) throw new AutoOffsetError('no-notes');

  const infoOffset = typeof info.offset === 'number' && Number.isFinite(info.offset) ? info.offset : null;
  return { format, infoOffset, notes, audio: findAudio(files, info.music) };
}
