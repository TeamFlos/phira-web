/** Stable failure codes so the UI can translate every expected error. */
export type AutoOffsetErrorCode =
  | 'invalid-archive'
  | 'no-chart'
  | 'pbc-unsupported'
  | 'no-notes'
  | 'no-audio'
  | 'download-failed'
  | 'audio-decode'
  | 'audio-too-large'
  | 'audio-too-long'
  | 'worker';

export class AutoOffsetError extends Error {
  constructor(
    readonly code: AutoOffsetErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'AutoOffsetError';
  }
}
