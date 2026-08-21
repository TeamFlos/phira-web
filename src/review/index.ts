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
import type { ChartVersion, PirateMatch, ReviewCheckR } from '../model';
import { effectiveTrackStatus, worstPolicyStatus } from '../policy';

export type CheckLevel = 'ok' | 'info' | 'warning' | 'problem';

/** Mirrors CensorView's local type; /censor-detail is loosely typed in the schema. */
export type CensorSegment = { text: string; censored: boolean };
export type CensorHit = { field: 'name' | 'description' | 'tags'; segments: CensorSegment[] };

// --- manual checklist ---------------------------------------------------------

/**
 * Items the reviewer must tick before approving. i18n labels live in
 * ReviewCard.vue keyed by these ids. The first four attest that the
 * automated checks' output was reviewed by a human (false positives happen);
 * the rest cover what machines cannot judge. cl-sync retires when the
 * delay-alignment wasm check lands; delete it here when that happens.
 */
export const REVIEW_MANUAL_ITEMS = ['cl-copyright', 'cl-pirate', 'cl-censor', 'cl-metadata', 'cl-sync', 'cl-content', 'cl-thorough', 'cl-play'] as const;

// --- derivations ------------------------------------------------------------

/** Levenshtein edit distance between two strings (case-insensitive). */
export function editDistance(a: string, b: string): number {
  const s = a.toLowerCase().trim();
  const t = b.toLowerCase().trim();
  if (s === t) return 0;
  const m = s.length;
  const n = t.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const prev = new Array(n + 1);
  const curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
}

/** Minimum edit distance from the query to the match name or any alias. */
export function minDistance(query: string, name: string, aliases?: string[]): number {
  if (!query) return 0;
  return Math.min(editDistance(query, name), ...(aliases ?? []).map((a) => editDistance(query, a)));
}

/** The copyright verdict, only when a match within edit distance 10 exists. */
export function copyrightProblem(result: ReviewCheckR | undefined, query: { track: string; artist: string }): 'forbidden' | 'restricted' | undefined {
  const status = result?.compositeStatus;
  if (status !== 'forbidden' && status !== 'restricted') return undefined;
  const hasCloseTrack = result!.tracks.some((t) => minDistance(query.track, t.name, t.aliases) <= 10);
  const hasCloseArtist = result!.artists.some((a) => minDistance(query.artist, a.name, a.aliases) <= 10);
  return hasCloseTrack || hasCloseArtist ? status : undefined;
}

/** Closest match carrying the problem status, as `name by artist`, for templates. */
export function problemDetail(result: ReviewCheckR | undefined, problem: 'forbidden' | 'restricted', query: { track: string; artist: string }): string {
  if (!result) return '';
  const tracks = result.tracks
    .map((t) => ({ t, d: minDistance(query.track, t.name, t.aliases) }))
    .filter((x) => x.d <= 10)
    .sort((a, b) => a.d - b.d);
  const track = (tracks.find((x) => effectiveTrackStatus(x.t) === problem) ?? tracks[0])?.t;
  if (track) return `${track.name} by ${track.artist}`;
  const artists = result.artists
    .map((a) => ({ a, d: minDistance(query.artist, a.name, a.aliases) }))
    .filter((x) => x.d <= 10)
    .sort((a, b) => a.d - b.d);
  return artists[0]?.a.name ?? '';
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
 * `hasProblems`. This is where the delay-alignment wasm package plugs in
 * once it exists.
 */
export function useReviewChecks(version: () => ChartVersion, uploaderId: () => number | undefined) {
  const api = useApi();

  const loading = ref(true);
  const copyright = ref<ReviewCheckR>();
  /** The track and artist queries used for the copyright search, for edit-distance display. */
  const copyrightQuery = ref<{ track: string; artist: string }>({ track: '', artist: '' });
  /** Sides of the copyright lookup skipped for empty input, for the UI hint. */
  const copyrightSuppressed = ref<('track' | 'artist')[]>([]);
  const censorHits = ref<CensorHit[]>([]);
  /** Cross-chart file duplicates: stolen (other uploader) vs same-uploader re-upload. */
  const stolenMatches = ref<PirateMatch[]>([]);
  const duplicateMatches = ref<PirateMatch[]>([]);

  async function run(v: ChartVersion) {
    loading.value = true;
    copyright.value = undefined;
    copyrightSuppressed.value = [];
    censorHits.value = [];
    stolenMatches.value = [];
    duplicateMatches.value = [];
    const content = v.content;
    // An empty subquery would match the whole Meilisearch index, so a side
    // whose field is blank is dropped entirely; both blank skips the call.
    const track = content.name.trim();
    const artist = content.composer.trim();
    copyrightQuery.value = { track, artist };
    const policyReq = track || artist ? api.POST('/content-policy/review-check', { body: { track, artist }, toastError: true }) : undefined;
    const [policyRes, pirateRes, ...censorRes] = await Promise.all([
      policyReq,
      api.POST('/anti-pirate/check', { body: { checksum: v.checksum }, toastError: true }),
      ...(['name', 'description', 'tags'] as const).map(async (field) => {
        const text = field === 'tags' ? content.tags.join(' ') : (content[field] ?? '');
        if (!text) return undefined;
        const { data, error } = await api.POST('/censor-detail', { body: { text }, toastError: true });
        if (error || !data) return undefined;
        const segments = data as unknown as CensorSegment[];
        return segments.some((s) => s.censored) ? { field, segments } : undefined;
      }),
    ]);
    // Drop own-chart rows; dedupe by chartId (backend returns both the live
    // row and every version row sharing the checksum). Then split by uploader.
    const seenChart = new Set<number>();
    const foreign = (pirateRes.data?.matches ?? []).filter((m) => m.chartId !== v.chart).filter((m) => !seenChart.has(m.chartId) && seenChart.add(m.chartId));
    const uploader = uploaderId();
    stolenMatches.value = foreign.filter((m) => uploader != null && m.uploaderId !== uploader);
    duplicateMatches.value = foreign.filter((m) => uploader != null && m.uploaderId === uploader);
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

  const problem = computed(() => copyrightProblem(copyright.value, copyrightQuery.value));
  const hasProblems = computed(() => !!problem.value || censorHits.value.length > 0 || stolenMatches.value.length > 0 || duplicateMatches.value.length > 0);

  return { loading, copyright, copyrightQuery, copyrightSuppressed, censorHits, stolenMatches, duplicateMatches, problem, hasProblems };
}
