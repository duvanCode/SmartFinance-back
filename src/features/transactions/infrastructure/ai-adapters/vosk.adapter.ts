import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ISpeechToText } from '../../domain/interfaces/speech-to-text.interface';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Vosk Adapter for offline speech-to-text.
 *
 * Requirements:
 * 1. Install Visual Studio Build Tools (for Windows)
 * 2. npm install vosk
 * 3. Download Spanish model from https://alphacephei.com/vosk/models
 *    Recommended: vosk-model-small-es-0.42 (~50MB)
 * 4. Place model in src/assets/models/vosk-model-small-es-0.42
 */
@Injectable()
export class VoskAdapter implements ISpeechToText, OnModuleInit {
    private readonly logger = new Logger(VoskAdapter.name);
    private model: any = null;
    private isAvailable = false;
    private readonly modelPath = path.join(process.cwd(), 'src/assets/models/vosk-model-small-es-0.42');

    async onModuleInit() {
        await this.initializeVosk();
    }

    private async initializeVosk(): Promise<void> {
        try {
            // Check if vosk is installed
            const vosk = await import('vosk').catch(() => null);

            if (!vosk) {
                this.logger.warn(
                    'Vosk is not installed. Audio transcription will not be available. ' +
                    'To enable: 1) Install Visual Studio Build Tools, 2) npm install vosk'
                );
                return;
            }

            // Check if model exists
            if (!fs.existsSync(this.modelPath)) {
                this.logger.warn(
                    `Vosk model not found at ${this.modelPath}. ` +
                    'Download from https://alphacephei.com/vosk/models and place in src/assets/models/'
                );
                return;
            }

            // Initialize model
            vosk.setLogLevel(-1); // Suppress vosk logs
            this.model = new vosk.Model(this.modelPath);
            this.isAvailable = true;
            this.logger.log('Vosk model loaded successfully');

        } catch (error) {
            this.logger.warn(`Failed to initialize Vosk: ${error.message}`);
        }
    }

    async transcribe(buffer: Buffer): Promise<string> {
        if (!this.isAvailable || !this.model) {
            throw new Error(
                'Speech-to-text is not available. ' +
                'Please install Vosk and download a Spanish model.'
            );
        }

        try {
            this.logger.log('Starting audio transcription with Vosk...');

            const vosk = await import('vosk');

            // Create recognizer with 16kHz sample rate
            const recognizer = new vosk.Recognizer({ model: this.model, sampleRate: 16000 });

            // Convert audio buffer to PCM if needed
            const pcmBuffer = await this.convertToPcm(buffer);

            // Process audio in chunks
            const chunkSize = 4000;
            for (let i = 0; i < pcmBuffer.length; i += chunkSize) {
                const chunk = pcmBuffer.subarray(i, i + chunkSize);
                recognizer.acceptWaveform(chunk);
            }

            // Get final result
            const result = recognizer.finalResult();
            recognizer.free();

            const transcription = result.text || '';
            this.logger.log(`Transcription completed: "${transcription.substring(0, 50)}..."`);

            return transcription;

        } catch (error) {
            this.logger.error(`Transcription failed: ${error.message}`, error.stack);
            throw new Error(`Failed to transcribe audio: ${error.message}`);
        }
    }

    private async convertToPcm(buffer: Buffer): Promise<Buffer> {
        // Check if it's already a WAV file with PCM data
        const isWav = buffer.length > 44 &&
            buffer.toString('utf8', 0, 4) === 'RIFF' &&
            buffer.toString('utf8', 8, 12) === 'WAVE';

        if (isWav) {
            // Extract PCM data from WAV (skip 44-byte header)
            return buffer.subarray(44);
        }

        // For other formats, we need ffmpeg to convert
        // For now, assume the buffer is raw PCM 16-bit mono 16kHz
        return buffer;
    }
}
