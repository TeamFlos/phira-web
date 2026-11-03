/* @ts-self-types="./prpr_auto_offset_wasm.d.ts" */

/**
 * Full alignment result. See upstream [`AlignResult`](pao::AlignResult).
 */
export class JsAlignResult {
    static __wrap(ptr) {
        const obj = Object.create(JsAlignResult.prototype);
        obj.__wbg_ptr = ptr;
        JsAlignResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsAlignResultFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsalignresult_free(ptr, 0);
    }
    /**
     * Squared L2 energy of the sampled audio novelty signal.
     * @returns {number}
     */
    get audio_energy() {
        const ret = wasm.__wbg_get_jsalignresult_audio_energy(this.__wbg_ptr);
        return ret;
    }
    /**
     * Normalized cross-correlation peak in [0.0, 1.0].
     * @returns {number}
     */
    get correlation() {
        const ret = wasm.__wbg_get_jsalignresult_correlation(this.__wbg_ptr);
        return ret;
    }
    /**
     * Squared L2 energy of the sampled note signal.
     * @returns {number}
     */
    get note_energy() {
        const ret = wasm.__wbg_get_jsalignresult_note_energy(this.__wbg_ptr);
        return ret;
    }
    /**
     * Suggested absolute offset, in seconds.
     * @returns {number}
     */
    get offset() {
        const ret = wasm.__wbg_get_jsalignresult_offset(this.__wbg_ptr);
        return ret;
    }
    /**
     * Unnormalized dot-product peak at the selected offset.
     * @returns {number}
     */
    get raw_peak() {
        const ret = wasm.__wbg_get_jsalignresult_raw_peak(this.__wbg_ptr);
        return ret;
    }
    /**
     * Whether the correlation exceeds the reliability threshold.
     * @returns {boolean}
     */
    get reliable() {
        const ret = wasm.__wbg_get_jsalignresult_reliable(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Number of points in the correlation curve.
     * @returns {number}
     */
    curve_len() {
        const ret = wasm.jsalignresult_curve_len(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Absolute offset (seconds) of each correlation-curve point.
     * @returns {Float64Array}
     */
    curve_offsets() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.jsalignresult_curve_offsets(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayF64FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 8, 8);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Normalized correlation score of each curve point.
     * @returns {Float32Array}
     */
    curve_values() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.jsalignresult_curve_values(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayF32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Squared L2 energy of the sampled audio novelty signal.
     * @param {number} arg0
     */
    set audio_energy(arg0) {
        wasm.__wbg_set_jsalignresult_audio_energy(this.__wbg_ptr, arg0);
    }
    /**
     * Normalized cross-correlation peak in [0.0, 1.0].
     * @param {number} arg0
     */
    set correlation(arg0) {
        wasm.__wbg_set_jsalignresult_correlation(this.__wbg_ptr, arg0);
    }
    /**
     * Squared L2 energy of the sampled note signal.
     * @param {number} arg0
     */
    set note_energy(arg0) {
        wasm.__wbg_set_jsalignresult_note_energy(this.__wbg_ptr, arg0);
    }
    /**
     * Suggested absolute offset, in seconds.
     * @param {number} arg0
     */
    set offset(arg0) {
        wasm.__wbg_set_jsalignresult_offset(this.__wbg_ptr, arg0);
    }
    /**
     * Unnormalized dot-product peak at the selected offset.
     * @param {number} arg0
     */
    set raw_peak(arg0) {
        wasm.__wbg_set_jsalignresult_raw_peak(this.__wbg_ptr, arg0);
    }
    /**
     * Whether the correlation exceeds the reliability threshold.
     * @param {boolean} arg0
     */
    set reliable(arg0) {
        wasm.__wbg_set_jsalignresult_reliable(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) JsAlignResult.prototype[Symbol.dispose] = JsAlignResult.prototype.free;

/**
 * Opaque handle to any `prpr-auto-offset` [`Signal`](pao::Signal). Construct one from an
 * audio frontend or a note frontend, then sample it or pass it to `estimate_with`/`estimate`.
 */
export class SignalHandle {
    static __wrap(ptr) {
        const obj = Object.create(SignalHandle.prototype);
        obj.__wbg_ptr = ptr;
        SignalHandleFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SignalHandleFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_signalhandle_free(ptr, 0);
    }
    /**
     * Energy-difference novelty signal (diagnostic).
     * @param {Float32Array} pcm
     * @param {number} sample_rate
     * @param {number} frame_ms
     * @param {number} hop_ms
     * @returns {SignalHandle}
     */
    static energyDiff(pcm, sample_rate, frame_ms, hop_ms) {
        const ptr0 = passArrayF32ToWasm0(pcm, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.signalhandle_energyDiff(ptr0, len0, sample_rate, frame_ms, hop_ms);
        return SignalHandle.__wrap(ret);
    }
    /**
     * Plain Gaussian note signal (diagnostic note frontend).
     * @param {Float64Array} times
     * @param {number} sigma
     * @returns {SignalHandle}
     */
    static gaussianNote(times, sigma) {
        const ptr0 = passArrayF64ToWasm0(times, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.signalhandle_gaussianNote(ptr0, len0, sigma);
        return SignalHandle.__wrap(ret);
    }
    /**
     * Sample the signal at arbitrary timestamps (seconds). Returns one value per timestamp.
     * @param {Float64Array} ts
     * @returns {Float32Array}
     */
    sample(ts) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayF64ToWasm0(ts, wasm.__wbindgen_export);
            const len0 = WASM_VECTOR_LEN;
            wasm.signalhandle_sample(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v2 = getArrayF32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Spectral-flux novelty signal (diagnostic).
     * @param {Float32Array} pcm
     * @param {number} sample_rate
     * @param {number} fft_size
     * @param {number} hop_size
     * @returns {SignalHandle}
     */
    static spectralFlux(pcm, sample_rate, fft_size, hop_size) {
        const ptr0 = passArrayF32ToWasm0(pcm, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.signalhandle_spectralFlux(ptr0, len0, sample_rate, fft_size, hop_size);
        return SignalHandle.__wrap(ret);
    }
    /**
     * `superflux` onset signal (recommended audio frontend).
     * @param {Float32Array} pcm
     * @param {number} sample_rate
     * @param {number} window_size
     * @param {number} hop_size
     * @returns {SignalHandle}
     */
    static superflux(pcm, sample_rate, window_size, hop_size) {
        const ptr0 = passArrayF32ToWasm0(pcm, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.signalhandle_superflux(ptr0, len0, sample_rate, window_size, hop_size);
        return SignalHandle.__wrap(ret);
    }
    /**
     * Weighted-Gaussian note signal (recommended note frontend).
     *
     * `events` is a JS array of `{ time, kind }` objects (kind: 0=Tap,1=Hold,2=Flick,3=Drag);
     * `config` is a JS `{ maxNotesPerTime, dragRunWeight, ... }` object (all optional).
     * @param {any} events
     * @param {number} sigma
     * @param {any} config
     * @returns {SignalHandle}
     */
    static weightedGaussianNote(events, sigma, config) {
        const ret = wasm.signalhandle_weightedGaussianNote(addHeapObject(events), sigma, addHeapObject(config));
        return SignalHandle.__wrap(ret);
    }
}
if (Symbol.dispose) SignalHandle.prototype[Symbol.dispose] = SignalHandle.prototype.free;

/**
 * A computed log-magnitude filterbank spectrogram, for debugging/visualization.
 */
export class Spectrogram {
    static __wrap(ptr) {
        const obj = Object.create(Spectrogram.prototype);
        obj.__wbg_ptr = ptr;
        SpectrogramFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SpectrogramFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_spectrogram_free(ptr, 0);
    }
    /**
     * Number of frames.
     * @returns {number}
     */
    frame_count() {
        const ret = wasm.spectrogram_frame_count(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Frame rate (Hz) implied by the hop size.
     * @returns {number}
     */
    frame_rate() {
        const ret = wasm.spectrogram_frame_rate(this.__wbg_ptr);
        return ret;
    }
    /**
     * All frames flattened into a single `[frame][band]` row-major buffer.
     * @returns {Float32Array}
     */
    frames_flat() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.spectrogram_frames_flat(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayF32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export4(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Number of filter bands.
     * @returns {number}
     */
    n_bands() {
        const ret = wasm.spectrogram_n_bands(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Time step between native frames, in seconds.
     * @returns {number}
     */
    native_dt() {
        const ret = wasm.spectrogram_native_dt(this.__wbg_ptr);
        return ret;
    }
    /**
     * Timestamp of the first native frame, in seconds.
     * @returns {number}
     */
    native_t0() {
        const ret = wasm.spectrogram_native_t0(this.__wbg_ptr);
        return ret;
    }
}
if (Symbol.dispose) Spectrogram.prototype[Symbol.dispose] = Spectrogram.prototype.free;

/**
 * Compute a filterbank log-magnitude spectrogram (SuperFlux's first stage).
 *
 * `bands_per_octave`, `fmin`, `fmax` default to 24, 30, 17000 when `0`/`0.0`.
 * @param {Float32Array} pcm
 * @param {number} sample_rate
 * @param {number} window_size
 * @param {number} hop_size
 * @param {number} bands_per_octave
 * @param {number} fmin
 * @param {number} fmax
 * @returns {Spectrogram}
 */
export function compute_spectrogram(pcm, sample_rate, window_size, hop_size, bands_per_octave, fmin, fmax) {
    const ptr0 = passArrayF32ToWasm0(pcm, wasm.__wbindgen_export);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.compute_spectrogram(ptr0, len0, sample_rate, window_size, hop_size, bands_per_octave, fmin, fmax);
    return Spectrogram.__wrap(ret);
}

/**
 * Estimate the offset between two pre-built signals with default configuration.
 * @param {SignalHandle} audio
 * @param {SignalHandle} note
 * @param {number} duration_sec
 * @returns {JsAlignResult}
 */
export function estimate(audio, note, duration_sec) {
    _assertClass(audio, SignalHandle);
    _assertClass(note, SignalHandle);
    const ret = wasm.estimate(audio.__wbg_ptr, note.__wbg_ptr, duration_sec);
    return JsAlignResult.__wrap(ret);
}

/**
 * One-call entry point: build an audio frontend and a note frontend from a JS options object,
 * then run the alignment. Returns an error string on invalid input.
 * @param {any} opts
 * @returns {JsAlignResult}
 */
export function estimate_auto_offset(opts) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.estimate_auto_offset(retptr, addHeapObject(opts));
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        if (r2) {
            throw takeObject(r1);
        }
        return JsAlignResult.__wrap(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
 * Estimate the offset between two pre-built signals with a custom config.
 *
 * `config` is a JS `{ searchRangeSec, samplingIntervalSec, searchCenterSec }` object
 * (all optional).
 * @param {SignalHandle} audio
 * @param {SignalHandle} note
 * @param {number} duration_sec
 * @param {any} config
 * @returns {JsAlignResult}
 */
export function estimate_with(audio, note, duration_sec, config) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        _assertClass(audio, SignalHandle);
        _assertClass(note, SignalHandle);
        wasm.estimate_with(retptr, audio.__wbg_ptr, note.__wbg_ptr, duration_sec, addHeapObject(config));
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        if (r2) {
            throw takeObject(r1);
        }
        return JsAlignResult.__wrap(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg_Error_67e7344beaa85059: function(arg0, arg1) {
            const ret = Error(getStringFromWasm0(arg0, arg1));
            return addHeapObject(ret);
        },
        __wbg_Number_c54e7112a3fa7e3e: function(arg0) {
            const ret = Number(getObject(arg0));
            return ret;
        },
        __wbg_String_8564e559799eccda: function(arg0, arg1) {
            const ret = String(getObject(arg1));
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_bigint_get_as_i64_b482365c149396c8: function(arg0, arg1) {
            const v = getObject(arg1);
            const ret = typeof(v) === 'bigint' ? v : undefined;
            getDataViewMemory0().setBigInt64(arg0 + 8 * 1, isLikeNone(ret) ? BigInt(0) : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_boolean_get_7a12af2b3f899c5a: function(arg0) {
            const v = getObject(arg0);
            const ret = typeof(v) === 'boolean' ? v : undefined;
            return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
        },
        __wbg___wbindgen_debug_string_0e68cf47c9cbd9b0: function(arg0, arg1) {
            const ret = debugString(getObject(arg1));
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_in_50072d4d6e45c193: function(arg0, arg1) {
            const ret = getObject(arg0) in getObject(arg1);
            return ret;
        },
        __wbg___wbindgen_is_bigint_60fc0336cb14f5d7: function(arg0) {
            const ret = typeof(getObject(arg0)) === 'bigint';
            return ret;
        },
        __wbg___wbindgen_is_function_fcda5e3902d732fe: function(arg0) {
            const ret = typeof(getObject(arg0)) === 'function';
            return ret;
        },
        __wbg___wbindgen_is_object_edb6b15aa3afe12e: function(arg0) {
            const val = getObject(arg0);
            const ret = typeof(val) === 'object' && val !== null;
            return ret;
        },
        __wbg___wbindgen_is_undefined_8c687d0b90d5b524: function(arg0) {
            const ret = getObject(arg0) === undefined;
            return ret;
        },
        __wbg___wbindgen_jsval_eq_9fdcd3c0a860dd3b: function(arg0, arg1) {
            const ret = getObject(arg0) === getObject(arg1);
            return ret;
        },
        __wbg___wbindgen_jsval_loose_eq_3c30021c243b64cd: function(arg0, arg1) {
            const ret = getObject(arg0) == getObject(arg1);
            return ret;
        },
        __wbg___wbindgen_number_get_1dc732b810cb937c: function(arg0, arg1) {
            const obj = getObject(arg1);
            const ret = typeof(obj) === 'number' ? obj : undefined;
            getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_string_get_92ab86bb19cbc12f: function(arg0, arg1) {
            const obj = getObject(arg1);
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_throw_5d9e815e6fdf150f: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg_call_269c5566fbede3eb: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).call(getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_done_cffed884d87aa22e: function(arg0) {
            const ret = getObject(arg0).done;
            return ret;
        },
        __wbg_get_6cf5a4d4d8ad3c5a: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.get(getObject(arg0), getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_get_unchecked_363572bdd397d473: function(arg0, arg1) {
            const ret = getObject(arg0)[arg1 >>> 0];
            return addHeapObject(ret);
        },
        __wbg_get_with_ref_key_6412cf3094599694: function(arg0, arg1) {
            const ret = getObject(arg0)[getObject(arg1)];
            return addHeapObject(ret);
        },
        __wbg_instanceof_ArrayBuffer_d4ff01f8247925ae: function(arg0) {
            let result;
            try {
                result = getObject(arg0) instanceof ArrayBuffer;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_Uint8Array_598adc0fef426aa8: function(arg0) {
            let result;
            try {
                result = getObject(arg0) instanceof Uint8Array;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_isArray_5674713bb7b79043: function(arg0) {
            const ret = Array.isArray(getObject(arg0));
            return ret;
        },
        __wbg_isSafeInteger_8f51c743827d1ec5: function(arg0) {
            const ret = Number.isSafeInteger(getObject(arg0));
            return ret;
        },
        __wbg_iterator_22ddeb808cf55a6f: function() {
            const ret = Symbol.iterator;
            return addHeapObject(ret);
        },
        __wbg_length_31bdaf014f5fbde2: function(arg0) {
            const ret = getObject(arg0).length;
            return ret;
        },
        __wbg_length_4e1adc0d42e23620: function(arg0) {
            const ret = getObject(arg0).length;
            return ret;
        },
        __wbg_new_1da3429bc3c4541c: function(arg0) {
            const ret = new Uint8Array(getObject(arg0));
            return addHeapObject(ret);
        },
        __wbg_next_95053e306b1c3aed: function(arg0) {
            const ret = getObject(arg0).next;
            return addHeapObject(ret);
        },
        __wbg_next_f31ecb8646d2c605: function() { return handleError(function (arg0) {
            const ret = getObject(arg0).next();
            return addHeapObject(ret);
        }, arguments); },
        __wbg_prototypesetcall_ae9f5e7459250748: function(arg0, arg1, arg2) {
            Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), getObject(arg2));
        },
        __wbg_value_c227f843d21da141: function(arg0) {
            const ret = getObject(arg0).value;
            return addHeapObject(ret);
        },
        __wbindgen_generic_0000000000000001: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return addHeapObject(ret);
        },
        __wbindgen_generic_0000000000000002: function(arg0) {
            // Cast intrinsic for `U64 -> Externref`.
            const ret = BigInt.asUintN(64, arg0);
            return addHeapObject(ret);
        },
        __wbindgen_object_clone_ref: function(arg0) {
            const ret = getObject(arg0);
            return addHeapObject(ret);
        },
        __wbindgen_object_drop_ref: function(arg0) {
            takeObject(arg0);
        },
    };
    return {
        __proto__: null,
        "./prpr_auto_offset_wasm_bg.js": import0,
    };
}

const JsAlignResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsalignresult_free(ptr, 1));
const SignalHandleFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_signalhandle_free(ptr, 1));
const SpectrogramFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_spectrogram_free(ptr, 1));

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function dropObject(idx) {
    if (idx < 1028) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function getArrayF32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayF64FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

let cachedFloat32ArrayMemory0 = null;
function getFloat32ArrayMemory0() {
    if (cachedFloat32ArrayMemory0 === null || cachedFloat32ArrayMemory0.byteLength === 0) {
        cachedFloat32ArrayMemory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachedFloat32ArrayMemory0;
}

let cachedFloat64ArrayMemory0 = null;
function getFloat64ArrayMemory0() {
    if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
        cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getObject(idx) { return heap[idx]; }

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_export3(addHeapObject(e));
    }
}

let heap = new Array(1024).fill(undefined);
heap.push(undefined, null, true, false);

let heap_next = heap.length;

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passArrayF32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getFloat32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayF64ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 8, 8) >>> 0;
    getFloat64ArrayMemory0().set(arg, ptr / 8);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedFloat32ArrayMemory0 = null;
    cachedFloat64ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (!module.ok) {
            throw new Error(`failed to fetch Wasm: ${module.status} ${module.statusText} fetching '${module.url}'`);
        }

        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('prpr_auto_offset_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
