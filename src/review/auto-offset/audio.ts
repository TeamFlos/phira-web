import { AutoOffsetError } from './errors';

/** Longest audio we are willing to decode and analyse, in seconds. */
const MAX_AUDIO_SECONDS = 15 * 60;
/** Large enough for any real track; a larger blob would only risk a tab OOM. */
const MAX_AUDIO_BYTES = 100 * 1024 * 1024;

/**
 * Decode a compressed audio track to mono 44.1 kHz PCM.
 *
 * `decodeAudioData` needs an ArrayBuffer it owns, so the view is copied out of
 * the zip buffer first (channels are averaged to mono).
 */
export async function decodeMonoPcm(bytes: Uint8Array): Promise<{ pcm: Float32Array; sampleRate: number; duration: number }> {
  if (bytes.byteLength > MAX_AUDIO_BYTES) throw new AutoOffsetError('audio-too-large');
  // `Uint8Array.buffer` is typed as ArrayBufferLike although the zip reader
  // always hands us a plain ArrayBuffer; decodeAudioData rejects SharedArrayBuffer.
  const copy = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const context = new AudioContext({ sampleRate: 44100 });
  try {
    let audio: AudioBuffer;
    try {
      audio = await context.decodeAudioData(copy);
    } catch {
      throw new AutoOffsetError('audio-decode');
    }
    if (audio.duration > MAX_AUDIO_SECONDS) throw new AutoOffsetError('audio-too-long');
    const pcm = new Float32Array(audio.length);
    for (let channel = 0; channel < audio.numberOfChannels; channel++) {
      const data = audio.getChannelData(channel);
      for (let i = 0; i < pcm.length; i++) pcm[i] += data[i] / audio.numberOfChannels;
    }
    return { pcm, sampleRate: audio.sampleRate, duration: audio.duration };
  } finally {
    await context.close();
  }
}
