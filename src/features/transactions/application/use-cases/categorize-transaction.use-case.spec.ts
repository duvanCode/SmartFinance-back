import { Test, TestingModule } from '@nestjs/testing';
import { CategorizeTransactionUseCase } from './categorize-transaction.use-case';
// Correct relative path to interface: same feature, up 2 levels
import { AI_CATEGORIZER } from '../../domain/interfaces/ai-categorizer.interface';
// Correct relative path to external feature: up 3 levels to features root, then into categories
import { CATEGORY_REPOSITORY } from '../../../categories/domain/repositories/category.repository.interface';
import { CategoryType } from '../../../categories/domain/enums/category-type.enum';

describe('CategorizeTransactionUseCase', () => {
    let useCase: CategorizeTransactionUseCase;
    let aiCategorizer: any;
    let categoryRepository: any;

    const mockCategories = [
        {
            id: 'cat-1',
            name: { getValue: () => 'Food' },
            type: CategoryType.EXPENSE,
        },
        {
            id: 'cat-2',
            name: { getValue: () => 'Transport' },
            type: CategoryType.EXPENSE,
        },
    ];

    beforeEach(async () => {
        aiCategorizer = {
            categorize: jest.fn(),
        };

        categoryRepository = {
            findByUserIdAndType: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CategorizeTransactionUseCase,
                { provide: AI_CATEGORIZER, useValue: aiCategorizer },
                { provide: CATEGORY_REPOSITORY, useValue: categoryRepository },
            ],
        }).compile();

        useCase = module.get<CategorizeTransactionUseCase>(CategorizeTransactionUseCase);
    });

    it('should categorize transaction successfully', async () => {
        categoryRepository.findByUserIdAndType.mockResolvedValue(mockCategories);
        aiCategorizer.categorize.mockResolvedValue({
            categoryId: 'cat-1',
            confidence: 0.9,
            reasoning: 'Matches food description',
        });

        const result = await useCase.execute({
            userId: 'user-1',
            description: 'Lunch at restaurant',
            amount: 50,
        });

        expect(categoryRepository.findByUserIdAndType).toHaveBeenCalledWith(
            'user-1',
            CategoryType.EXPENSE,
        );
        expect(aiCategorizer.categorize).toHaveBeenCalledWith(
            'Lunch at restaurant',
            50,
            mockCategories,
        );
        expect(result.categoryId).toBe('cat-1');
    });

    it('should throw error if no categories found', async () => {
        categoryRepository.findByUserIdAndType.mockResolvedValue([]);

        await expect(
            useCase.execute({
                userId: 'user-1',
                description: 'test',
                amount: 10,
            }),
        ).rejects.toThrow();
    });
});
