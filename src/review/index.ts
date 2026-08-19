/**
 * Review checks: data fetching and rule logic for the review card. Display
 * lives in src/components/review/*.vue; this module is the single place to
 * touch when adding or tuning a check.
 *
 * Severity ladder: 'ok' < 'info' < 'warning' < 'problem'. Only 'problem'
 * flips the review card's default action to deny; info/warning findings are
 * displayed as reminders next to the version metadata.
 */
import { computed, ref, watch } from 'vue';

import { useApi } from '../api/client';
import type { ChartVersion, ReviewCheckR } from '../model';
import { effectiveTrackStatus, worstPolicyStatus } from '../policy';

export type CheckLevel = 'ok' | 'info' | 'warning' | 'problem';

/** Mirrors CensorView's local type; /censor-detail is loosely typed in the schema. */
export type CensorSegment = { text: string; censored: boolean };
export type CensorHit = { field: 'name' | 'description' | 'tags'; segments: CensorSegment[] };

// --- manual checklist ---------------------------------------------------------

/**
 * Items the reviewer must tick before approving. i18n labels live in
 * ReviewCard.vue keyed by these ids. The first three attest that the
 * automated checks' output was reviewed by a human (false positives happen);
 * the rest cover what machines cannot judge. cl-sync retires when the
 * delay-alignment wasm check lands, cl-original when the stolen-upload
 * endpoint exists; delete them here when that happens.
 */
export const REVIEW_MANUAL_ITEMS = ['cl-copyright', 'cl-censor', 'cl-metadata', 'cl-sync', 'cl-original', 'cl-content', 'cl-thorough', 'cl-play'] as const;

// --- derivations ------------------------------------------------------------

/** The copyright verdict, reduced to the two statuses that block a clean approve. */
export function copyrightProblem(result: ReviewCheckR | undefined): 'forbidden' | 'restricted' | undefined {
  const status = result?.compositeStatus;
  return status === 'forbidden' || status === 'restricted' ? status : undefined;
}

/** First match carrying the problem status, as `name — artist`, for templates. */
export function problemDetail(result: ReviewCheckR | undefined, problem: 'forbidden' | 'restricted'): string {
  if (!result) return '';
  const track = result.tracks.find((v) => effectiveTrackStatus(v) === problem) ?? result.tracks[0];
  if (track) return `${track.name} — ${track.artist}`;
  return result.artists[0]?.name ?? '';
}

/**
 * Fields that carried blocked words, for the rejection template. The words
 * themselves must never leave the reviewer's screen: quoting them in the
 * message would re-publish the censored content and leak the blocklist.
 */
export function censoredFields(hits: CensorHit[]): ('name' | 'description' | 'tags')[] {
  return [...new Set(hits.map((h) => h.field))];
}

// --- orchestration ------------------------------------------------------------

/**
 * Run every automated check against a version and expose the results plus
 * the aggregate verdict. Re-runs when the version changes.
 *
 * Adding a check: write its runner, add it to the Promise.all below, expose
 * its result ref, and give it a display component under components/review/.
 * If its findings should flip the default action to deny, fold them into
 * `hasProblems`. This is where the delay-alignment wasm package and the
 * stolen-upload endpoint plug in once they exist.
 */
export function useReviewChecks(version: () => ChartVersion) {
  const api = useApi();

  const loading = ref(true);
  const copyright = ref<ReviewCheckR>();
  /** Sides of the copyright lookup skipped for empty input, for the UI hint. */
  const copyrightSuppressed = ref<('track' | 'artist')[]>([]);
  const censorHits = ref<CensorHit[]>([]);

  async function run(v: ChartVersion) {
    loading.value = true;
    copyright.value = undefined;
    copyrightSuppressed.value = [];
    censorHits.value = [];
    const content = v.content;
    // An empty subquery would match the whole Meilisearch index, so a side
    // whose field is blank is dropped entirely; both blank skips the call.
    const track = content.name.trim();
    const artist = content.composer.trim();
    const policyReq = track || artist ? api.POST('/content-policy/review-check', { body: { track, artist }, toastError: true }) : undefined;
    const [policyRes, ...censorRes] = await Promise.all([
      policyReq,
      ...(['name', 'description', 'tags'] as const).map(async (field) => {
        const text = field === 'tags' ? content.tags.join(' ') : (content[field] ?? '');
        if (!text) return undefined;
        const { data, error } = await api.POST('/censor-detail', { body: { text }, toastError: true });
        if (error || !data) return undefined;
        const segments = data as unknown as CensorSegment[];
        return segments.some((s) => s.censored) ? { field, segments } : undefined;
      }),
    ]);
    if (policyRes?.data) {
      const r = policyRes.data as ReviewCheckR;
      const tracks = track ? r.tracks : [];
      const artists = artist ? r.artists : [];
      if (!track) copyrightSuppressed.value.push('track');
      if (!artist) copyrightSuppressed.value.push('artist');
      copyright.value = {
        tracks,
        artists,
        // With a side dropped the server's composite covers junk matches;
        // recompute over what is left.
        compositeStatus: copyrightSuppressed.value.length ? worstPolicyStatus([...tracks.map(effectiveTrackStatus), ...artists.map((a) => a.status)]) : r.compositeStatus,
      };
    } else if (!track && !artist) {
      copyrightSuppressed.value = ['track', 'artist'];
    }
    censorHits.value = censorRes.filter((h): h is CensorHit => !!h);
    loading.value = false;
  }

  watch(version, run, { immediate: true });

  const problem = computed(() => copyrightProblem(copyright.value));
  const hasProblems = computed(() => !!problem.value || censorHits.value.length > 0);

  return { loading, copyright, copyrightSuppressed, censorHits, problem, hasProblems };
}
