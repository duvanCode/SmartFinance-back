import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ITTSRepository,
  TTS_REPOSITORY,
  VoiceConfig,
} from '../../domain/repositories/tts.repository.interface';
import {
  IVoiceTransportRepository,
  VOICE_TRANSPORT_REPOSITORY,
} from '../../domain/repositories/voice-transport.repository.interface';

const DEFAULT_VOICE: VoiceConfig = {
  language: 'es-419',
};

/**
 * Speaks a given text directly through TTS without LLM inference.
 * Used for agent-initiated messages like wizard greetings.
 */
@Injectable()
export class SpeakDirectlyUseCase {
  private readonly logger = new Logger(SpeakDirectlyUseCase.name);

  constructor(
    @Inject(TTS_REPOSITORY) private readonly tts: ITTSRepository,
    @Inject(VOICE_TRANSPORT_REPOSITORY)
    private readonly transport: IVoiceTransportRepository,
  ) {}

  async execute(sessionId: string, text: string): Promise<void> {
    if (!text.trim()) return;

    this.logger.log(`Direct speech for session ${sessionId}: "${text.substring(0, 60)}..."`);

    // Emit the text as a text_chunk so the chat panel shows it
    this.transport.sendTextChunk(sessionId, text);

    try {
      for await (const chunk of this.tts.synthesize(text, DEFAULT_VOICE)) {
        this.transport.sendAudioChunk(sessionId, chunk);
      }
    } catch (err) {
      this.logger.error(`Direct TTS error: ${err instanceof Error ? err.message : String(err)}`);
    }

    this.transport.sendTurnEnd(sessionId);
  }
}
