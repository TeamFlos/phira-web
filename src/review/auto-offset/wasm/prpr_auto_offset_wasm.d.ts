/* tslint:disable */
/* eslint-disable */

/**
 * Full alignment result. See upstream [`AlignResult`](pao::AlignResult).
 */
export class JsAlignResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Number of points in the correlation curve.
     */
    curve_len(): number;
    /**
     * Absolute offset (seconds) of each correlation-curve point.
     */
    curve_offsets(): Float64Array;
    /**
     * Normalized correlation score of each curve point.
     */
    curve_values(): Float32Array;
    /**
     * Squared L2 energy of the sampled audio novelty signal.
     */
    audio_energy: number;
    /**
     * Normalized cross-correlation peak in [0.0, 1.0].
     */
    correlation: number;
    /**
     * Squared L2 energy of the sampled note signal.
     */
    note_energy: number;
    /**
     * Suggested absolute offset, in seconds.
     */
    offset: number;
    /**
     * Unnormalized dot-product peak at the selected offset.
     */
    raw_peak: number;
    /**
     * Whether the correlation exceeds the reliability threshold.
     */
    reliable: boolean;
}

/**
 * Opaque handle to any `prpr-auto-offset` [`Signal`](pao::Signal). Construct one from an
 * audio frontend or a note frontend, then sample it or pass it to `estimate_with`/`estimate`.
 */
export class SignalHandle {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Energy-difference novelty signal (diagnostic).
     */
    static energyDiff(pcm: Float32Array, sample_rate: number, frame_ms: number, hop_ms: number): SignalHandle;
    /**
     * Plain Gaussian note signal (diagnostic note frontend).
     */
    static gaussianNote(times: Float64Array, sigma: number): SignalHandle;
    /**
     * Sample the signal at arbitrary timestamps (seconds). Returns one value per timestamp.
     */
    sample(ts: Float64Array): Float32Array;
    /**
     * Spectral-flux novelty signal (diagnostic).
     */
    static spectralFlux(pcm: Float32Array, sample_rate: number, fft_size: number, hop_size: number): SignalHandle;
    /**
     * `superflux` onset signal (recommended audio frontend).
     */
    static superflux(pcm: Float32Array, sample_rate: number, window_size: number, hop_size: number): SignalHandle;
    /**
     * Weighted-Gaussian note signal (recommended note frontend).
     *
     * `events` is a JS array of `{ time, kind }` objects (kind: 0=Tap,1=Hold,2=Flick,3=Drag);
     * `config` is a JS `{ maxNotesPerTime, dragRunWeight, ... }` object (all optional).
     */
    static weightedGaussianNote(events: any, sigma: number, config: any): SignalHandle;
}

/**
 * A computed log-magnitude filterbank spectrogram, for debugging/visualization.
 */
export class Spectrogram {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Number of frames.
     */
    frame_count(): number;
    /**
     * Frame rate (Hz) implied by the hop size.
     */
    frame_rate(): number;
    /**
     * All frames flattened into a single `[frame][band]` row-major buffer.
     */
    frames_flat(): Float32Array;
    /**
     * Number of filter bands.
     */
    n_bands(): number;
    /**
     * Time step between native frames, in seconds.
     */
    native_dt(): number;
    /**
     * Timestamp of the first native frame, in seconds.
     */
    native_t0(): number;
}

/**
 * Compute a filterbank log-magnitude spectrogram (SuperFlux's first stage).
 *
 * `bands_per_octave`, `fmin`, `fmax` default to 24, 30, 17000 when `0`/`0.0`.
 */
export function compute_spectrogram(pcm: Float32Array, sample_rate: number, window_size: number, hop_size: number, bands_per_octave: number, fmin: number, fmax: number): Spectrogram;

/**
 * Estimate the offset between two pre-built signals with default configuration.
 */
export function estimate(audio: SignalHandle, note: SignalHandle, duration_sec: number): JsAlignResult;

/**
 * One-call entry point: build an audio frontend and a note frontend from a JS options object,
 * then run the alignment. Returns an error string on invalid input.
 */
export function estimate_auto_offset(opts: any): JsAlignResult;

/**
 * Estimate the offset between two pre-built signals with a custom config.
 *
 * `config` is a JS `{ searchRangeSec, samplingIntervalSec, searchCenterSec }` object
 * (all optional).
 */
export function estimate_with(audio: SignalHandle, note: SignalHandle, duration_sec: number, config: any): JsAlignResult;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_get_jsalignresult_audio_energy: (a: number) => number;
    readonly __wbg_get_jsalignresult_correlation: (a: number) => number;
    readonly __wbg_get_jsalignresult_note_energy: (a: number) => number;
    readonly __wbg_get_jsalignresult_offset: (a: number) => number;
    readonly __wbg_get_jsalignresult_raw_peak: (a: number) => number;
    readonly __wbg_get_jsalignresult_reliable: (a: number) => number;
    readonly __wbg_jsalignresult_free: (a: number, b: number) => void;
    readonly __wbg_set_jsalignresult_audio_energy: (a: number, b: number) => void;
    readonly __wbg_set_jsalignresult_correlation: (a: number, b: number) => void;
    readonly __wbg_set_jsalignresult_note_energy: (a: number, b: number) => void;
    readonly __wbg_set_jsalignresult_offset: (a: number, b: number) => void;
    readonly __wbg_set_jsalignresult_raw_peak: (a: number, b: number) => void;
    readonly __wbg_set_jsalignresult_reliable: (a: number, b: number) => void;
    readonly __wbg_signalhandle_free: (a: number, b: number) => void;
    readonly __wbg_spectrogram_free: (a: number, b: number) => void;
    readonly compute_spectrogram: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => number;
    readonly estimate: (a: number, b: number, c: number) => number;
    readonly estimate_auto_offset: (a: number, b: number) => void;
    readonly estimate_with: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly jsalignresult_curve_len: (a: number) => number;
    readonly jsalignresult_curve_offsets: (a: number, b: number) => void;
    readonly jsalignresult_curve_values: (a: number, b: number) => void;
    readonly signalhandle_energyDiff: (a: number, b: number, c: number, d: number, e: number) => number;
    readonly signalhandle_gaussianNote: (a: number, b: number, c: number) => number;
    readonly signalhandle_sample: (a: number, b: number, c: number, d: number) => void;
    readonly signalhandle_spectralFlux: (a: number, b: number, c: number, d: number, e: number) => number;
    readonly signalhandle_superflux: (a: number, b: number, c: number, d: number, e: number) => number;
    readonly signalhandle_weightedGaussianNote: (a: number, b: number, c: number) => number;
    readonly spectrogram_frame_count: (a: number) => number;
    readonly spectrogram_frame_rate: (a: number) => number;
    readonly spectrogram_frames_flat: (a: number, b: number) => void;
    readonly spectrogram_n_bands: (a: number) => number;
    readonly spectrogram_native_dt: (a: number) => number;
    readonly spectrogram_native_t0: (a: number) => number;
    readonly __wbindgen_export: (a: number, b: number) => number;
    readonly __wbindgen_export2: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_export3: (a: number) => void;
    readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
    readonly __wbindgen_export4: (a: number, b: number, c: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
