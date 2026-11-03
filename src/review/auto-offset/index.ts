export { AutoOffsetError } from './errors';
export type { AutoOffsetErrorCode } from './errors';
export { estimateVersionOffset, OFFSET_SEARCH_RANGE_SEC } from './run';
export type { AutoOffsetResult } from './run';
export { formatDelayMs, judgeOffset, OFFSET_CORRELATION_THRESHOLD, scoreAtOffset } from './verdict';
export type { OffsetVerdict, OffsetVerdictKind } from './verdict';
export type { CorrelationCurve, EstimateOutcome } from './engine';
