export const VOICE_TRANSPORT_REPOSITORY = Symbol('IVoiceTransportRepository');

export interface IVoiceTransportRepository {
  /** Send a raw PCM/MP3 audio chunk (Buffer as base64) to the client session. */
  sendAudioChunk(sessionId: string, chunk: Buffer): void;

  /** Send a text token (LLM streaming) to the client session. */
  sendTextChunk(sessionId: string, text: string): void;

  /** Send an agent action (type + jsCode) to the client session. */
  sendAction(
    sessionId: string,
    action: { type: string; payload?: Record<string, unknown>; jsCode?: string },
  ): void;

  /** Send transcript chunk (partial STT result) to the client session. */
  sendTranscriptChunk(sessionId: string, text: string, isFinal: boolean): void;

  /** Signal end of agent turn. */
  sendTurnEnd(sessionId: string): void;

  /** Send an error message to the client. */
  sendError(sessionId: string, message: string): void;
}
