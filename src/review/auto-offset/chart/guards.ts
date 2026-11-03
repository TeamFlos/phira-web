/** Canonical narrowing helper for the untrusted JSON inside chart packages. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
