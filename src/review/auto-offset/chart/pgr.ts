import { isRecord } from './guards';
import type { NoteKind, ParsedNote } from './pec';

const KINDS: Record<number, NoteKind> = { 1: 'tap', 2: 'drag', 3: 'hold', 4: 'flick' };

/**
 * Parse a Phigros JSON chart.
 * Note times are in 1/32 beats and scaled per judge line by its BPM.
 */
export function parsePgr(json: unknown): { notes: ParsedNote[] } {
  if (!isRecord(json) || !Array.isArray(json.judgeLineList)) throw new Error('PGR chart has no judgeLineList');
  const notes: ParsedNote[] = [];
  for (const line of json.judgeLineList) {
    if (!isRecord(line)) continue;
    const bpm = Number(line.bpm);
    if (!Number.isFinite(bpm) || bpm <= 0) continue;
    const scale = 60 / 32 / bpm;
    for (const key of ['notesAbove', 'notesBelow'] as const) {
      const list = line[key];
      if (!Array.isArray(list)) continue;
      for (const note of list) {
        if (!isRecord(note)) continue;
        const kind = KINDS[Number(note.type)];
        const time = Number(note.time) * scale;
        if (!kind || !Number.isFinite(time) || time < 0) continue;
        if (kind === 'hold') notes.push({ time, kind, endTime: time + Number(note.holdTime ?? 0) * scale });
        else notes.push({ time, kind });
      }
    }
  }
  notes.sort((a, b) => a.time - b.time);
  return { notes };
}
