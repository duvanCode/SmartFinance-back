import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { ISTTRepository } from '../../../../domain/repositories/stt.repository.interface';
import { toFile } from 'groq-sdk';

@Injectable()
export class GroqSTTConnector implements ISTTRepository {
  private readonly logger = new Logger(GroqSTTConnector.name);
  private readonly client: Groq;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    this.client = new Groq({
      apiKey: this.config.get<string>('GROQ_API_KEY', ''),
    });
    this.model = this.config.get<string>(
      'GROQ_WHISPER_MODEL',
      'whisper-large-v3-turbo',
    );
  }

  async transcribe(audioBuffer: Buffer, mimeType = 'audio/webm'): Promise<string> {
    try {
      // Determine file extension from mimeType
      const ext = mimeType.includes('ogg')
        ? 'ogg'
        : mimeType.includes('mp4') || mimeType.includes('m4a')
          ? 'mp4'
          : mimeType.includes('mp3')
            ? 'mp3'
            : 'webm';

      const file = await toFile(audioBuffer, `audio.${ext}`, {
        type: mimeType,
      });

      const transcription = await this.client.audio.transcriptions.create({
        file,
        model: this.model,
        language: 'es',
        response_format: 'text',
      });

      return typeof transcription === 'string'
        ? transcription
        : (transcription as any).text ?? '';
    } catch (err) {
      this.logger.error('Groq Whisper STT failed', err);
      throw err;
    }
  }
}
