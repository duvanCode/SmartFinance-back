import { Inject, Injectable } from '@nestjs/common';
import {
    SPEECH_TO_TEXT,
    ISpeechToText,
} from '../../domain/interfaces/speech-to-text.interface';
import { CreateTransactionFromTextUseCase } from './create-transaction-from-text.use-case';

@Injectable()
export class CreateTransactionFromAudioUseCase {
    constructor(
        @Inject(SPEECH_TO_TEXT) private readonly speechToText: ISpeechToText,
        private readonly createFromTextUseCase: CreateTransactionFromTextUseCase,
    ) { }

    async execute(userId: string, audioBuffer: Buffer) {
        // 1. Transcribe audio to text locally using Vosk
        const transcription = await this.speechToText.transcribe(audioBuffer);

        if (!transcription || transcription.trim().length === 0) {
            throw new Error('Could not transcribe audio');
        }

        // 2. Delegate to Text Use Case to extract transactions
        const result = await this.createFromTextUseCase.execute(userId, transcription);

        return {
            transcription,
            transactions: result,
        };
    }
}
