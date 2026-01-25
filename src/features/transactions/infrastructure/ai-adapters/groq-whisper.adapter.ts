import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI, { toFile } from 'openai';
import { ISpeechToText } from '../../domain/interfaces/speech-to-text.interface';

@Injectable()
export class GroqWhisperAdapter implements ISpeechToText {
    private readonly client: OpenAI;
    private readonly logger = new Logger(GroqWhisperAdapter.name);
    private readonly model: string = 'whisper-large-v3';

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('GROQ_API_KEY');

        if (!apiKey || apiKey === 'your_groq_api_key_here') {
            this.logger.warn(
                'GROQ_API_KEY is not configured. Audio transcription via Groq will be unavailable.'
            );
        }

        this.client = new OpenAI({
            apiKey: apiKey || 'dummy-key',
            baseURL: 'https://api.groq.com/openai/v1',
        });
    }

    private checkAvailability() {
        const apiKey = this.configService.get<string>('GROQ_API_KEY');
        if (!apiKey || apiKey === 'your_groq_api_key_here') {
            throw new Error(
                'Groq AI is not configured. Please add a valid GROQ_API_KEY to your .env file.'
            );
        }
    }

    async transcribe(buffer: Buffer): Promise<string> {
        try {
            this.checkAvailability();
            this.logger.log('Starting audio transcription with Groq Whisper...');

            // Convert buffer to file-like object for Groq API
            const file = await toFile(buffer, 'audio.wav', { type: 'audio/wav' });

            const transcription = await this.client.audio.transcriptions.create({
                file: file,
                model: this.model,
                language: 'es', // Explicitly set Spanish for better accuracy
                response_format: 'json',
            });

            this.logger.log(`Transcription completed successfully`);
            return transcription.text;

        } catch (error) {
            this.logger.error(`Transcription failed: ${error.message}`, error.stack);
            throw new Error(`Failed to transcribe audio with Groq: ${error.message}`);
        }
    }
}
