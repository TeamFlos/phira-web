/**
 * `POST /upload/{name}` is documented with `content = Vec<u8>` (octet-stream),
 * which openapi-typescript renders as `number[]`. Browsers already have a
 * perfectly good body for binary uploads — a `File` — so pass it through the
 * same typed client with a cast, keeping the Authorization + 401-refresh
 * middleware from client.ts. Same trick as review.ts.
 */
import type { ApiClient } from './client';
import { apiError } from './client';

/** A temp upload handle: send this id back inside `files` (and reference it
 * from `related` / the text) when creating the issue. */
export type TempUpload = {
  id: string;
  expireAt: string;
};

export async function uploadTempFile(api: ApiClient, file: File): Promise<TempUpload> {
  const { data, error } = await (api.POST as any)('/upload/{name}', {
    params: { path: { name: file.name } },
    body: file,
  });
  if (error) throw apiError(error);
  return data as TempUpload;
}
