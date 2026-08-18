/**
 * `POST /chart/{id}/review` is registered in phira-api with a plain
 * `.route(...)` rather than `routes!(...)` (`phira-server/src/route/chart.rs`),
 * so it carries no utoipa annotation and is absent from the generated
 * `schema.d.ts`. Until it is documented, call it through the same
 * openapi-fetch client — the path is cast, but the request still goes through
 * the Authorization + 401-refresh middleware installed in `client.ts`.
 *
 * Once the endpoint appears in the schema, delete this module and call
 * `api.POST('/chart/{id}/review', …)` directly.
 */
import type { ApiClient } from './client';
import { apiError } from './client';

export type ReviewBody = {
  approve: boolean;
  /** Required when denying, forbidden when approving (server-enforced). */
  reason?: string;
};

export type ReviewResult = {
  /** True when this vote was the one that pushed the chart past the threshold. */
  passed: boolean;
};

export async function reviewChart(api: ApiClient, id: number, body: ReviewBody): Promise<ReviewResult> {
  const { data, error } = await (api.POST as any)('/chart/{id}/review', {
    params: { path: { id } },
    body,
  });
  if (error) throw apiError(error);
  return data as ReviewResult;
}
