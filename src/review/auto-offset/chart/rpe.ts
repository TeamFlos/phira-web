import { isRecord } from './guards';
import { BpmList } from './pec';
import type { NoteKind, ParsedNote } from './pec';

const KINDS: Record<number, NoteKind> = { 1: 'tap', 2: 'hold', 3: 'flick', 4: 'drag' };

/** RPE beat coordinates are either a plain beat or `[beat, numerator, denominator]`. */
function beats(value: unknown): number {
  if (Array.isArray(value)) return Number(value[0]) + Number(value[1]) / Number(value[2]);
  return Number(value);
}

/**
 * Parse an RPE JSON chart.
 * Note times are beat coordinates resolved through the chart's BPM list.
 */
export function parseRpe(json: unknown): { notes: ParsedNote[] } {
  if (!isRecord(json)) throw new Error('invalid RPE chart');
  const bpmList = json.BPMList;
  const lines = json.judgeLineList;
  if (!Array.isArray(bpmList) || !bpmList.length) throw new Error('RPE chart has no BPMList');
  if (!Array.isArray(lines)) throw new Error('RPE chart has no judgeLineList');
  const ranges: [number, number][] = [];
  for (const item of bpmList) {
    if (!isRecord(item)) continue;
    const bpm = Number(item.bpm);
    if (Number.isFinite(bpm) && bpm > 0) ranges.push([beats(item.startTime), bpm]);
  }
  const bpm = new BpmList(ranges);
  const notes: ParsedNote[] = [];
  for (const line of lines) {
    if (!isRecord(line) || !Array.isArray(line.notes)) continue;
    for (const note of line.notes) {
      if (!isRecord(note)) continue;
      const kind = KINDS[Number(note.type)];
      if (!kind) continue;
      const time = bpm.timeBeats(beats(note.startTime));
      if (!Number.isFinite(time) || time < 0) continue;
      const endTime = note.endTime != null ? bpm.timeBeats(beats(note.endTime)) : time;
      const fake = Number(note.isFake ?? 0) !== 0;
      if (kind === 'hold' && endTime > time) notes.push({ time, kind, endTime, fake });
      else notes.push({ time, kind, fake });
    }
  }
  notes.sort((a, b) => a.time - b.time);
  return { notes };
}
