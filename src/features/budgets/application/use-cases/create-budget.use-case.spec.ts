import { Test, TestingModule } from '@nestjs/testing';
import { CreateBudgetUseCase } from './create-budget.use-case';
import { BUDGET_REPOSITORY } from '../../domain/repositories/budget.repository.interface';
import { CATEGORY_REPOSITORY } from '../../../categories/domain/repositories/category.repository.interface';
import { CategoryType } from '../../../categories/domain/enums/category-type.enum';
import { BudgetPeriod } from '../../domain/enums/budget-period.enum';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Budget } from '../../domain/entities/budget.entity';

describe('CreateBudgetUseCase', () => {
    let useCase: CreateBudgetUseCase;
    let budgetRepository: any;
    let categoryRepository: any;

    const mockCategory = {
        id: 'category-123',
        userId: 'user-123',
        name: { getValue: () => 'Food' },
        type: CategoryType.EXPENSE,
    };

    const mockBudget = {
        id: 'budget-123',
        userId: 'user-123',
        categoryId: 'category-123',
        amount: { toNumber: () => 500.0 },
        period: BudgetPeriod.MONTHLY,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        budgetRepository = {
            existsActiveForCategory: jest.fn(),
            create: jest.fn(),
        };

        categoryRepository = {
            findById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateBudgetUseCase,
                {
                    provide: BUDGET_REPOSITORY,
                    useValue: budgetRepository,
                },
                {
                    provide: CATEGORY_REPOSITORY,
                    useValue: categoryRepository,
                },
            ],
        }).compile();

        useCase = module.get<CreateBudgetUseCase>(CreateBudgetUseCase);
    });

    it('should create a budget successfully', async () => {
        categoryRepository.findById.mockResolvedValue(mockCategory);
        budgetRepository.existsActiveForCategory.mockResolvedValue(false);
        budgetRepository.create.mockResolvedValue(mockBudget);

        const result = await useCase.execute({
            userId: 'user-123',
            categoryId: 'category-123',
            amount: 500.0,
            period: BudgetPeriod.MONTHLY,
        });

        expect(result.id).toBe(mockBudget.id);
        expect(budgetRepository.create).toHaveBeenCalled();
    });

    it('should throw error if category not found', async () => {
        categoryRepository.findById.mockResolvedValue(null);

        await expect(
            useCase.execute({
                userId: 'user-123',
                categoryId: 'non-existent',
                amount: 500.0,
                period: BudgetPeriod.MONTHLY,
            }),
        ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if category type is INCOME', async () => {
        categoryRepository.findById.mockResolvedValue({
            ...mockCategory,
            type: CategoryType.INCOME,
        });

        await expect(
            useCase.execute({
                userId: 'user-123',
                categoryId: 'category-123',
                amount: 500.0,
                period: BudgetPeriod.MONTHLY,
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if active budget exists', async () => {
        categoryRepository.findById.mockResolvedValue(mockCategory);
        budgetRepository.existsActiveForCategory.mockResolvedValue(true);

        await expect(
            useCase.execute({
                userId: 'user-123',
                categoryId: 'category-123',
                amount: 500.0,
                period: BudgetPeriod.MONTHLY,
            }),
        ).rejects.toThrow(BadRequestException);
    });
});
