import { Test, TestingModule } from '@nestjs/testing';
import { BudgetAnalyzerService } from './budget-analyzer.service';
import { BUDGET_REPOSITORY } from '../../domain/repositories/budget.repository.interface';
import { TRANSACTION_REPOSITORY } from '../../../transactions/domain/repositories/transaction.repository.interface';
import { Budget } from '../../domain/entities/budget.entity';
import { BudgetPeriod } from '../../domain/enums/budget-period.enum';
import { TransactionType } from '../../../transactions/domain/enums/transaction-type.enum';

describe('BudgetAnalyzerService', () => {
    let service: BudgetAnalyzerService;
    let budgetRepository: any;
    let transactionRepository: any;

    const mockBudget = {
        id: 'budget-123',
        userId: 'user-123',
        categoryId: 'category-123',
        amount: { toNumber: () => 1000.0 }, // BudgetAmount mock
        getPeriodDateRange: jest.fn().mockReturnValue({
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-31'),
        }),
        calculateStatus: jest.fn().mockImplementation((spent) => ({
            budgetId: 'budget-123',
            categoryId: 'category-123',
            budgetAmount: 1000.0,
            spentAmount: spent,
            remainingAmount: 1000.0 - spent,
            percentageUsed: (spent / 1000.0) * 100,
            isExceeded: spent > 1000.0,
            alertLevel: 'normal',
        })),
    };

    // Explicitly typing transactions to include categoryId for filter check
    const mockTransactions = [
        { amount: { toNumber: () => 100.0 }, categoryId: 'category-123', type: TransactionType.EXPENSE },
        { amount: { toNumber: () => 50.0 }, categoryId: 'category-123', type: TransactionType.EXPENSE },
        { amount: { toNumber: () => 200.0 }, categoryId: 'other-category', type: TransactionType.EXPENSE }, // Should be ignored
    ];

    beforeEach(async () => {
        budgetRepository = {
            findById: jest.fn(),
        };

        transactionRepository = {
            getTotalByUserIdAndDateRange: jest.fn(),
            findByUserIdAndDateRange: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BudgetAnalyzerService,
                {
                    provide: BUDGET_REPOSITORY,
                    useValue: budgetRepository,
                },
                {
                    provide: TRANSACTION_REPOSITORY,
                    useValue: transactionRepository,
                },
            ],
        }).compile();

        service = module.get<BudgetAnalyzerService>(BudgetAnalyzerService);
    });

    it('should calculate budget status correctly', async () => {
        budgetRepository.findById.mockResolvedValue(mockBudget);

        // Simulate finding transactions manually because service filters them
        transactionRepository.findByUserIdAndDateRange.mockResolvedValue(mockTransactions);

        // Mock getTotal to return sum of filtered transactions
        // In our implementation we used getTotalByUserIdndDateRange but then we realized it doesn't filter by category
        // So we used findByUserIdAndDateRange and filtered manually.
        // The service implementation handles logic.

        const result = await service.calculateBudgetProgress('budget-123');

        expect(budgetRepository.findById).toHaveBeenCalledWith('budget-123');
        expect(mockBudget.getPeriodDateRange).toHaveBeenCalled();
        expect(transactionRepository.findByUserIdAndDateRange).toHaveBeenCalled();

        // 100 + 50 = 150 (ignores other-category)
        expect(result.spentAmount).toBe(150.0);
        expect(result.budgetAmount).toBe(1000.0);
        expect(result.remainingAmount).toBe(850.0);
        expect(result.alertLevel).toBe('normal');
    });
});
