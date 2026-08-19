/**
 * Metadata rules: checks over the version's "信息填写区域" (the snapshot
 * fields). Each rule is a named function — its name is the finding's `key`,
 * which doubles as the i18n lookup key for both the inline hint
 * (`metadata-finding.<key>`) and the default rejection sentence
 * (`metadata-finding-reason.<key>`), both in main.ts.
 *
 * Findings are reminders, 'warning' at most — they never flip the review
 * card's default action on their own. Add a rule by writing a function and
 * registering it in METADATA_RULES.
 */
import type { ChartSnapshot } from '../model';

/** Which snapshot field the finding attaches to; drives inline placement. */
export type MetadataField = 'name' | 'composer' | 'charter' | 'illustrator' | 'level' | 'noteCount' | 'description' | 'tags';

export type MetadataFinding = {
  /** camelCase rule name; i18n key and list identity. */
  key: string;
  level: 'info' | 'warning';
  field: MetadataField;
};

/** Extra context some rules need beyond the version snapshot. */
export type MetadataContext = { uploaderName?: string };

type MetadataRule = (content: ChartSnapshot, ctx: MetadataContext) => MetadataFinding | null;

/** The client writes "UK" for unknown people and "UK Lv.10" for unrated charts. */
const PLACEHOLDER_PERSON = /^uk$/i;
const PLACEHOLDER_LEVEL = /^uk\b/i;

function composerMissing(c: ChartSnapshot): MetadataFinding | null {
  const composer = c.composer.trim();
  return !composer || PLACEHOLDER_PERSON.test(composer) ? { key: 'composerMissing', field: 'composer', level: 'warning' } : null;
}

function charterMissing(c: ChartSnapshot): MetadataFinding | null {
  const charter = c.charter.trim();
  return !charter || PLACEHOLDER_PERSON.test(charter) ? { key: 'charterMissing', field: 'charter', level: 'warning' } : null;
}

function illustratorMissing(c: ChartSnapshot): MetadataFinding | null {
  const illustrator = c.illustrator.trim();
  return !illustrator || PLACEHOLDER_PERSON.test(illustrator) ? { key: 'illustratorMissing', field: 'illustrator', level: 'warning' } : null;
}

function levelMissing(c: ChartSnapshot): MetadataFinding | null {
  const level = c.level.trim();
  return !level || PLACEHOLDER_LEVEL.test(level) ? { key: 'levelMissing', field: 'level', level: 'warning' } : null;
}

function composerIsUploader(c: ChartSnapshot, ctx: MetadataContext): MetadataFinding | null {
  if (!ctx.uploaderName) return null;
  return c.composer.trim().toLowerCase() === ctx.uploaderName.toLowerCase() ? { key: 'composerIsUploader', field: 'composer', level: 'warning' } : null;
}

function descriptionEmpty(c: ChartSnapshot): MetadataFinding | null {
  return !c.description?.trim() ? { key: 'descriptionEmpty', field: 'description', level: 'info' } : null;
}

function tagsEmpty(c: ChartSnapshot): MetadataFinding | null {
  return !c.tags.length ? { key: 'tagsEmpty', field: 'tags', level: 'info' } : null;
}

function noteCountZero(c: ChartSnapshot): MetadataFinding | null {
  return c.noteCount === 0 ? { key: 'noteCountZero', field: 'noteCount', level: 'warning' } : null;
}

/** The number inside level text like "IN Lv.14". */
const LEVEL_NUMBER = /Lv\.\s*(\d+(?:\.\d+)?)/i;

/**
 * Levels are written both as text ("IN Lv.14") and as a precise difficulty
 * (14.6). Communities floor or round, so only a gap of a full level or more
 * means the two genuinely disagree; unparseable level text is left to other
 * rules.
 */
function levelDifficultyMismatch(c: ChartSnapshot): MetadataFinding | null {
  if (PLACEHOLDER_LEVEL.test(c.level.trim())) return null; // levelMissing owns this case
  const match = LEVEL_NUMBER.exec(c.level);
  if (!match) return null;
  return Math.abs(parseFloat(match[1]) - c.difficulty) >= 1 ? { key: 'levelDifficultyMismatch', field: 'level', level: 'warning' } : null;
}

const METADATA_RULES: MetadataRule[] = [
  composerMissing,
  charterMissing,
  illustratorMissing,
  levelMissing,
  composerIsUploader,
  descriptionEmpty,
  tagsEmpty,
  noteCountZero,
  levelDifficultyMismatch,
];

export function runMetadataRules(content: ChartSnapshot, ctx: MetadataContext = {}): MetadataFinding[] {
  return METADATA_RULES.map((rule) => rule(content, ctx)).filter((f): f is MetadataFinding => !!f);
}
