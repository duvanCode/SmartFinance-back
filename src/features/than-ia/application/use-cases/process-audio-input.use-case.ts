import { Inject, Injectable, Logger } from '@nestjs/common';
import { ISTTRepository, STT_REPOSITORY } from '../../domain/repositories/stt.repository.interface';
import { ProcessTextInputUseCase } from './process-text-input.use-case';
import { PageContextDto } from '../dtos/page-context.dto';
import { IVoiceTransportRepository, VOICE_TRANSPORT_REPOSITORY } from '../../domain/repositories/voice-transport.repository.interface';

@Injectable()
export class ProcessAudioInputUseCase {
  private readonly logger = new Logger(ProcessAudioInputUseCase.name);

  // Per-session audio buffers (accumulated until audio_end)
  private readonly audioBuffers = new Map<string, Buffer[]>();

  constructor(
    @Inject(STT_REPOSITORY) private readonly stt: ISTTRepository,
    @Inject(VOICE_TRANSPORT_REPOSITORY) private readonly transport: IVoiceTransportRepository,
    private readonly processText: ProcessTextInputUseCase,
  ) {}

  appendChunk(sessionId: string, chunk: Buffer): void {
    if (!this.audioBuffers.has(sessionId)) {
      this.audioBuffers.set(sessionId, []);
    }
    this.audioBuffers.get(sessionId)!.push(chunk);
  }

  async finalizeAndProcess(
    sessionId: string,
    userId: string,
    pageContext: PageContextDto,
  ): Promise<void> {
    const chunks = this.audioBuffers.get(sessionId) ?? [];
    this.audioBuffers.delete(sessionId);

    if (chunks.length === 0) {
      this.logger.warn(`No audio chunks for session ${sessionId}`);
      return;
    }

    const audioBuffer = Buffer.concat(chunks);

    let transcription: string;
    try {
      transcription = await this.stt.transcribe(audioBuffer, 'audio/webm');
    } catch (err) {
      this.logger.error('STT transcription failed', err);
      return;
    }

    const tLower = transcription.toLowerCase().trim();
    const isHallucination = 
        tLower === 'gracias.' || 
        tLower === 'gracias' || 
        tLower === 'gracias...' ||
        tLower === 'amén.' ||
        tLower === 'amén' ||
        tLower === 'suscríbete al canal' ||
        tLower === 'suscríbete.' ||
        tLower.includes('amara.org');

    if (!transcription.trim() || isHallucination) {
      this.logger.warn(`Empty or hallucinated transcription received: "${transcription}"`);
      this.transport.sendTurnEnd(sessionId); // return UI to idle
      return;
    }

    this.logger.log(`Transcription for ${sessionId}: ${transcription}`);
    this.transport.sendTranscriptChunk(sessionId, transcription, true);

    await this.processText.execute(
      { text: transcription, pageContext },
      sessionId,
      userId,
    );
  }

  clearSession(sessionId: string): void {
    this.audioBuffers.delete(sessionId);
  }
}
