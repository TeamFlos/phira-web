/**
 * Shared helpers for chart version history: how a version's status is painted,
 * and the field-by-field diff between two versions.
 *
 * Labels live in the global i18n messages (`version-status.*`, `chart-field.*`)
 * rather than in an SFC `<i18n>` block, since the timeline, the detail panel,
 * the diff panel and the review queue all need the same wording.
 */
import type { ChartVersion, VersionStatus } from './model';

import { diff_match_patch, DIFF_DELETE, DIFF_INSERT } from 'diff-match-patch';

export type DiffOp = { type: 'equal' | 'del' | 'ins'; text: string };

const dmp = new diff_match_patch();
// Chart descriptions are short; bail out well before the frame budget is gone.
// On timeout the library still returns a correct — just less minimal — diff.
dmp.Diff_Timeout = 0.5;

/**
 * Diff two strings into a run of equal/deleted/inserted spans, in the order
 * they should be rendered (deletion before the insertion that replaces it).
 */
export function diffText(a: string, b: string): DiffOp[] {
  if (a === b) return a.length ? [{ type: 'equal', text: a }] : [];
  const diffs = dmp.diff_main(a, b);
  dmp.diff_cleanupSemantic(diffs);
  return diffs
    .filter(([, text]) => text.length)
    .map(([op, text]) => ({
      type: op === DIFF_DELETE ? 'del' : op === DIFF_INSERT ? 'ins' : 'equal',
      text,
    }));
}

/** DaisyUI badge modifier for each version status. */
export function statusBadgeClass(status: VersionStatus): string {
  switch (status) {
    case 'pending':
      return 'badge-warning';
    case 'published':
      return 'badge-success';
    case 'rejected':
      return 'badge-error';
    case 'awaitingCollaborators':
      return 'badge-info';
    case 'superseded':
    case 'yanked':
    default:
      return 'badge-ghost';
  }
}

/** Background for the timeline dot of each version status. */
export function statusDotClass(status: VersionStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-warning text-warning-content';
    case 'published':
      return 'bg-success text-success-content';
    case 'rejected':
      return 'bg-error text-error-content';
    case 'awaitingCollaborators':
      return 'bg-info text-info-content';
    case 'superseded':
    case 'yanked':
    default:
      return 'bg-base-300 text-base-content';
  }
}

/** Font Awesome glyph for the timeline dot of each version status. */
export function statusIcon(status: VersionStatus): string {
  switch (status) {
    case 'pending':
      return 'fa-hourglass-half';
    case 'published':
      return 'fa-check';
    case 'rejected':
      return 'fa-xmark';
    case 'awaitingCollaborators':
      return 'fa-user-clock';
    case 'yanked':
      return 'fa-ban';
    case 'superseded':
    default:
      return 'fa-clock-rotate-left';
  }
}

// --- diff ------------------------------------------------------------------

export type DiffRow =
  /** Short text or long prose, rendered with inline word/character highlights. */
  | { field: string; kind: 'text'; changed: boolean; from: string; to: string; ops: DiffOp[]; multiline: boolean }
  /** Numeric field, rendered as `old → new` plus the delta. */
  | { field: string; kind: 'number'; changed: boolean; from: number; to: number; digits: number }
  /** Tag set, rendered as added/removed chips. */
  | { field: string; kind: 'tags'; changed: boolean; added: string[]; removed: string[]; kept: string[] }
  /** Image, rendered as two thumbnails side by side. */
  | { field: string; kind: 'image'; changed: boolean; from: string; to: string }
  /** Opaque binary (chart archive, preview audio): only "changed or not". */
  | { field: string; kind: 'asset'; changed: boolean; from: string; to: string };

function textRow(field: string, from: string, to: string, multiline = false): DiffRow {
  const changed = from !== to;
  return { field, kind: 'text', changed, from, to, ops: changed ? diffText(from, to) : [], multiline };
}

function numberRow(field: string, from: number, to: number, digits: number): DiffRow {
  return { field, kind: 'number', changed: from !== to, from, to, digits };
}

/**
 * Compare two versions field by field, oldest (`from`) against newest (`to`),
 * in the order the diff panel should render them.
 *
 * The chart archive is compared by the version's `checksum` rather than by URL:
 * a re-upload of identical content can land on a different path, and the
 * checksum is what actually says whether the notes changed.
 */
export function diffVersions(from: ChartVersion, to: ChartVersion): DiffRow[] {
  const a = from.content;
  const b = to.content;
  return [
    textRow('name', a.name, b.name),
    textRow('level', a.level, b.level),
    numberRow('difficulty', a.difficulty, b.difficulty, 1),
    textRow('composer', a.composer, b.composer),
    textRow('charter', a.charter, b.charter),
    textRow('illustrator', a.illustrator, b.illustrator),
    numberRow('noteCount', a.noteCount, b.noteCount, 0),
    tagsRow(a.tags, b.tags),
    textRow('description', a.description ?? '', b.description ?? '', true),
    { field: 'illustration', kind: 'image', changed: a.illustration !== b.illustration, from: a.illustration, to: b.illustration },
    { field: 'preview', kind: 'asset', changed: a.preview !== b.preview, from: a.preview, to: b.preview },
    { field: 'file', kind: 'asset', changed: from.checksum !== to.checksum, from: a.file, to: b.file },
  ];
}

function tagsRow(from: string[], to: string[]): DiffRow {
  const before = new Set(from);
  const after = new Set(to);
  const added = to.filter((t) => !before.has(t));
  const removed = from.filter((t) => !after.has(t));
  const kept = to.filter((t) => before.has(t));
  return { field: 'tags', kind: 'tags', changed: added.length > 0 || removed.length > 0, added, removed, kept };
}
