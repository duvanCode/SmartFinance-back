export const STT_REPOSITORY = Symbol('ISTTRepository');

export interface ISTTRepository {
  /**
   * Transcribes raw audio buffer to text.
   * Returns the full transcription string.
   * (Groq Whisper is a batch API, so audio is accumulated before sending.)
   */
  transcribe(audioBuffer: Buffer, mimeType?: string): Promise<string>;
}
