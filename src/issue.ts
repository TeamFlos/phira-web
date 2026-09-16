// Shared helpers for the issue (工单) UI. The string unions come from the
// API's serde enums (see phira-api model/issue.rs); i18n label maps live in
// main.ts (`issue-category`, `issue-status`, `issue-target`) because they are
// used across several components.
import type { IssueCategory, IssueOperation, IssueRecord, IssueTarget } from './model';

/** Violation categories — the sub-select on the "Report Content" card, in the
 * API's stable numeric order. `question` / `featureRequest` are first-level
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
  'other',
];

export const ISSUE_OPERATIONS: IssueOperation[] = ['open', 'resolved', 'rejected', 'duplicated'];

/** Cloudflare Turnstile widget for the anonymous report endpoints. */
export const TURNSTILE_SITE_KEY = '0x4AAAAAAE36fNWFAj7pl0tl';

export function categoryLabelKey(category: IssueCategory): string {
  return `issue-category.${category}`;
}

export function statusLabelKey(status: IssueOperation): string {
  return `issue-status.${status}`;
}

/** daisyui badge class per status — color carries the state. */
export function statusBadgeClass(status: IssueOperation): string {
  switch (status) {
    case 'open':
      return 'badge-info';
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

/** i18n key + params for `谱面 #42`-style labels. */
export function issueTargetLabel(target: IssueTarget): { key: string; id: number } {
  const kind = target.type.toLowerCase();
  return { key: `issue-target.${kind}`, id: target.id };
}

/**
 * Who wrote a record: `null` created_by means the reporter followed up via
 * the magic link; otherwise a record by the issue's own creator is also the
 * reporter's voice, and everyone else is staff.
 */
export function recordIsReporter(issueCreatedBy: number | null | undefined, record: Pick<IssueRecord, 'createdBy'>): boolean {
  return record.createdBy == null || record.createdBy === issueCreatedBy;
}
