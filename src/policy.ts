/**
 * Shared helpers for the content-policy (copyright) library: how a
 * composite/entity status is painted and what it means.
 *
 * Statuses are an ordering — `unknown < free < restricted < forbidden` — but
 * for display each is independent; only `compositeRank` relies on the order.
 */
import type { CompositeStatus } from './model';

/** DaisyUI badge modifier for each content-policy status. */
export function policyBadgeClass(status: string): string {
  switch (status) {
    case 'free':
      return 'badge-success';
    case 'restricted':
      return 'badge-warning';
    case 'forbidden':
      return 'badge-error';
    case 'unknown':
    default:
      return 'badge-ghost';
  }
}

/** Font Awesome glyph for each content-policy status. */
export function policyStatusIcon(status: string): string {
  switch (status) {
    case 'free':
      return 'fa-circle-check';
    case 'restricted':
      return 'fa-triangle-exclamation';
    case 'forbidden':
      return 'fa-ban';
    case 'unknown':
    default:
      return 'fa-circle-question';
  }
}

/**
 * A track may carry `status: null` to inherit its rights holder's policy.
 * Resolve that inheritance; independent tracks (no rights holder) default to
 * `unknown`.
 */
export function effectiveTrackStatus(track: { status?: string | null; rhStatus?: string | null }): string {
  return track.status ?? track.rhStatus ?? 'unknown';
}
