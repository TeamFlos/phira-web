// Shared helpers for the issue (工单) UI. The string unions come from the
// API's serde enums (see phira-api model/issue.rs); i18n label maps live in
// main.ts (`issue-category`, `issue-status`, `issue-target`) because they are
// used across several components.
import type { IssueCategory, IssueOperation, IssueRecord, IssueSource, IssueTarget } from './model';

/** Violation categories — the sub-select on the "Report Content" card, in the
 * API's stable numeric order (`other` = 8 stays last as the catch-all despite
 * `cheatingOrDisruption` = 11). `question` / `featureRequest` are first-level
 * intents on the submit page and are not part of this list. */
export const ISSUE_CATEGORIES: IssueCategory[] = [
  'plagiarism',
  'rightsInfringement',
  'pornographic',
  'political',
  'provokingConflict',
  'illegal',
  'insultOrHarassment',
  'badValues',
  'cheatingOrDisruption',
  'other',
];

export const ISSUE_OPERATIONS: IssueOperation[] = ['open', 'waitingUser', 'resolved', 'rejected', 'duplicated'];

/** Cloudflare Turnstile widget for the anonymous report endpoints. */
export const TURNSTILE_SITE_KEY = '0x4AAAAAAE36fNWFAj7pl0tl';

export function categoryLabelKey(category: IssueCategory): string {
  return `issue-category.${category}`;
}

export function statusLabelKey(status: IssueOperation): string {
  return `issue-status.${status}`;
}

export function sourceLabelKey(source: IssueSource): string {
  return `issue-source.${source}`;
}

/** daisyui badge class per status — color carries the state. */
export function statusBadgeClass(status: IssueOperation): string {
  switch (status) {
    case 'open':
      return 'badge-info';
    case 'waitingUser':
      return 'badge-accent';
    case 'resolved':
      return 'badge-success';
    case 'rejected':
      return 'badge-error';
    case 'duplicated':
      return 'badge-warning';
  }
}

export function issueTargetPath(target: IssueTarget): string {
  switch (target.type) {
    case 'Chart':
      return `/chart/${target.id}`;
    case 'Collection':
      return `/collection/${target.id}`;
    case 'User':
      return `/user/${target.id}`;
  }
}

/** i18n key for the target kind; the caller renders it as `<label> #<id>`.
 * Deliberately interpolation-free: inline messages in main.ts are NOT
 * precompiled by unplugin-vue-i18n, and production builds use the
 * runtime-only vue-i18n (no JIT compiler), so `{id}` placeholders in them
 * would render literally. */
export function issueTargetLabel(target: IssueTarget): string {
  return `issue-target.${target.type.toLowerCase()}`;
}

/**
 * Who wrote a record: `null` created_by means the reporter followed up via
 * the magic link; otherwise a record by the issue's own creator is also the
 * reporter's voice, and everyone else is staff.
 */
export function recordIsReporter(issueCreatedBy: number | null | undefined, record: Pick<IssueRecord, 'createdBy'>): boolean {
  return record.createdBy == null || record.createdBy === issueCreatedBy;
}
