import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransactionFromAudioUseCase } from './create-transaction-from-audio.use-case';
import { CreateTransactionFromTextUseCase } from './create-transaction-from-text.use-case';
import { SPEECH_TO_TEXT } from '../../domain/interfaces/speech-to-text.interface';

describe('CreateTransactionFromAudioUseCase', () => {
    let useCase: CreateTransactionFromAudioUseCase;
    let speechToText: any;
    let createFromTextUseCase: any;

    beforeEach(async () => {
        speechToText = {
            transcribe: jest.fn(),
        };

        createFromTextUseCase = {
            execute: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateTransactionFromAudioUseCase,
                { provide: SPEECH_TO_TEXT, useValue: speechToText },
                { provide: CreateTransactionFromTextUseCase, useValue: createFromTextUseCase },
            ],
        }).compile();

        useCase = module.get<CreateTransactionFromAudioUseCase>(CreateTransactionFromAudioUseCase);
    });

    it('should transcribe audio and extract transactions', async () => {
        const mockAudioBuffer = Buffer.from('fake audio data');
        const transcribedText = 'Gasté 50 dólares en Uber y 30 en comida';
        const extractedTransactions = [
            {
                categoryId: 'cat-transport',
                confidence: 0.95,
                description: 'Uber',
                amount: 50,
            },
            {
                categoryId: 'cat-food',
                confidence: 0.90,
                description: 'Comida',
                amount: 30,
            },
        ];

        speechToText.transcribe.mockResolvedValue(transcribedText);
        createFromTextUseCase.execute.mockResolvedValue(extractedTransactions);

        const result = await useCase.execute('user-123', mockAudioBuffer);

        expect(speechToText.transcribe).toHaveBeenCalledWith(mockAudioBuffer);
        expect(createFromTextUseCase.execute).toHaveBeenCalledWith('user-123', transcribedText);
        expect(result.transcription).toBe(transcribedText);
        expect(result.transactions).toHaveLength(2);
        expect(result.transactions[0].amount).toBe(50);
    });

    it('should throw error if transcription is empty', async () => {
        const mockAudioBuffer = Buffer.from('fake audio data');

        speechToText.transcribe.mockResolvedValue('');

        await expect(
            useCase.execute('user-123', mockAudioBuffer),
        ).rejects.toThrow('Could not transcribe audio');
    });

    it('should throw error if transcription is only whitespace', async () => {
        const mockAudioBuffer = Buffer.from('fake audio data');

        speechToText.transcribe.mockResolvedValue('   \n\t   ');

        await expect(
            useCase.execute('user-123', mockAudioBuffer),
        ).rejects.toThrow('Could not transcribe audio');
    });

    it('should throw error if speech-to-text fails', async () => {
        const mockAudioBuffer = Buffer.from('fake audio data');

        speechToText.transcribe.mockRejectedValue(new Error('Vosk model not initialized'));

        await expect(
            useCase.execute('user-123', mockAudioBuffer),
        ).rejects.toThrow('Vosk model not initialized');
    });

    it('should handle audio with multiple transactions', async () => {
        const mockAudioBuffer = Buffer.from('fake audio data');
        const transcribedText = 'Ayer gasté 100 en supermercado, 50 en gasolina y hoy 25 en café';
        const extractedTransactions = [
            { categoryId: 'cat-1', confidence: 0.9, description: 'Supermercado', amount: 100 },
            { categoryId: 'cat-2', confidence: 0.85, description: 'Gasolina', amount: 50 },
            { categoryId: 'cat-3', confidence: 0.88, description: 'Café', amount: 25 },
        ];

        speechToText.transcribe.mockResolvedValue(transcribedText);
        createFromTextUseCase.execute.mockResolvedValue(extractedTransactions);

        const result = await useCase.execute('user-123', mockAudioBuffer);

        expect(result.transcription).toBe(transcribedText);
        expect(result.transactions).toHaveLength(3);
    });

    it('should return empty transactions array when no transactions detected in audio', async () => {
        const mockAudioBuffer = Buffer.from('fake audio data');
        const transcribedText = 'Hola, buenos días, ¿cómo estás?';

        speechToText.transcribe.mockResolvedValue(transcribedText);
        createFromTextUseCase.execute.mockResolvedValue([]);

        const result = await useCase.execute('user-123', mockAudioBuffer);

        expect(result.transcription).toBe(transcribedText);
        expect(result.transactions).toHaveLength(0);
    });
});
