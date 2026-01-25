import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransactionFromTextUseCase } from './create-transaction-from-text.use-case';
import { AI_CATEGORIZER } from '../../domain/interfaces/ai-categorizer.interface';
import { CATEGORY_REPOSITORY } from '../../../categories/domain/repositories/category.repository.interface';
import { CategoryType } from '../../../categories/domain/enums/category-type.enum';

describe('CreateTransactionFromTextUseCase', () => {
    let useCase: CreateTransactionFromTextUseCase;
    let aiCategorizer: any;
    let categoryRepository: any;

    const mockCategories = [
        {
            id: 'cat-food',
            name: { getValue: () => 'Alimentación' },
            type: CategoryType.EXPENSE,
        },
        {
            id: 'cat-transport',
            name: { getValue: () => 'Transporte' },
            type: CategoryType.EXPENSE,
        },
        {
            id: 'cat-entertainment',
            name: { getValue: () => 'Entretenimiento' },
            type: CategoryType.EXPENSE,
        },
    ];

    beforeEach(async () => {
        aiCategorizer = {
            extractTransactions: jest.fn(),
        };

        categoryRepository = {
            findByUserId: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateTransactionFromTextUseCase,
                { provide: AI_CATEGORIZER, useValue: aiCategorizer },
                { provide: CATEGORY_REPOSITORY, useValue: categoryRepository },
            ],
        }).compile();

        useCase = module.get<CreateTransactionFromTextUseCase>(CreateTransactionFromTextUseCase);
    });

    it('should extract multiple transactions from text', async () => {
        const inputText = 'Hoy gasté $50 en Uber, $30 en almuerzo y $10 en café';

        categoryRepository.findByUserId.mockResolvedValue(mockCategories);
        aiCategorizer.extractTransactions.mockResolvedValue([
            {
                categoryId: 'cat-transport',
                confidence: 0.95,
                reasoning: 'Uber is transportation',
                description: 'Uber',
                amount: 50,
            },
            {
                categoryId: 'cat-food',
                confidence: 0.90,
                reasoning: 'Almuerzo is food',
                description: 'Almuerzo',
                amount: 30,
            },
            {
                categoryId: 'cat-food',
                confidence: 0.85,
                reasoning: 'Café is food/beverage',
                description: 'Café',
                amount: 10,
            },
        ]);

        const result = await useCase.execute('user-123', inputText);

        expect(categoryRepository.findByUserId).toHaveBeenCalledWith('user-123');
        expect(aiCategorizer.extractTransactions).toHaveBeenCalledWith(
            inputText,
            mockCategories,
        );
        expect(result).toHaveLength(3);
        expect(result[0].amount).toBe(50);
        expect(result[0].description).toBe('Uber');
        expect(result[1].amount).toBe(30);
        expect(result[2].amount).toBe(10);
    });

    it('should return empty array when no transactions found', async () => {
        categoryRepository.findByUserId.mockResolvedValue(mockCategories);
        aiCategorizer.extractTransactions.mockResolvedValue([]);

        const result = await useCase.execute('user-123', 'Hola, ¿cómo estás?');

        expect(result).toHaveLength(0);
    });

    it('should handle text with relative dates', async () => {
        const inputText = 'Ayer gasté 100 pesos en gasolina';

        categoryRepository.findByUserId.mockResolvedValue(mockCategories);
        aiCategorizer.extractTransactions.mockResolvedValue([
            {
                categoryId: 'cat-transport',
                confidence: 0.92,
                reasoning: 'Gasoline for transportation',
                description: 'Gasolina (ayer)',
                amount: 100,
            },
        ]);

        const result = await useCase.execute('user-123', inputText);

        expect(result).toHaveLength(1);
        expect(result[0].description).toContain('ayer');
    });

    it('should handle various amount formats', async () => {
        const inputText = 'Pagué cincuenta dólares por la cena';

        categoryRepository.findByUserId.mockResolvedValue(mockCategories);
        aiCategorizer.extractTransactions.mockResolvedValue([
            {
                categoryId: 'cat-food',
                confidence: 0.88,
                reasoning: 'Dinner expense',
                description: 'Cena',
                amount: 50,
            },
        ]);

        const result = await useCase.execute('user-123', inputText);

        expect(result).toHaveLength(1);
        expect(result[0].amount).toBe(50);
    });

    it('should throw error if AI extraction fails', async () => {
        categoryRepository.findByUserId.mockResolvedValue(mockCategories);
        aiCategorizer.extractTransactions.mockRejectedValue(new Error('AI service unavailable'));

        await expect(
            useCase.execute('user-123', 'Compré algo'),
        ).rejects.toThrow('AI service unavailable');
    });
});
