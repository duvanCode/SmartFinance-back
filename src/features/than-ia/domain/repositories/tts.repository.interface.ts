export interface VoiceConfig {
  voice?: string;
  language?: string;
  speed?: number;
}

export const TTS_REPOSITORY = Symbol('ITTSRepository');

export interface ITTSRepository {
  /**
   * Synthesizes the given text into an audio stream.
   * Yields raw PCM/MP3 audio Buffer chunks as they arrive.
   */
  synthesize(text: string, voice: VoiceConfig): AsyncIterable<Buffer>;
}
