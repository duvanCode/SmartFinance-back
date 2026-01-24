import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { DateRange } from '../../domain/value-objects/date-range.vo';
import { TransactionType } from '@features/transactions/domain/enums/transaction-type.enum';

describe('AnalyticsService', () => {
    let service: AnalyticsService;
    let prisma: any;

    beforeEach(async () => {
        prisma = {
            transaction: {
                findMany: jest.fn(),
                groupBy: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AnalyticsService,
                { provide: PrismaService, useValue: prisma },
            ],
        }).compile();

        service = module.get<AnalyticsService>(AnalyticsService);
    });

    describe('getIncomeVsExpenses', () => {
        it('should calculate balance correctly', async () => {
            prisma.transaction.groupBy.mockResolvedValue([
                { type: TransactionType.INCOME, _sum: { amount: 1000 } },
                { type: TransactionType.EXPENSE, _sum: { amount: 400 } },
            ]);

            const range = DateRange.currentMonth();
            const result = await service.getIncomeVsExpenses('user-1', range);

            expect(result.income).toBe(1000);
            expect(result.expenses).toBe(400);
            expect(result.balance).toBe(600);
            expect(prisma.transaction.groupBy).toHaveBeenCalled();
        });
    });

    describe('getSpendingByCategory', () => {
        it('should group and calculate percentages', async () => {
            prisma.transaction.findMany.mockResolvedValue([
                {
                    categoryId: 'c1',
                    amount: 100,
                    category: { name: 'Food', color: 'red', icon: 'food' }
                },
                {
                    categoryId: 'c2',
                    amount: 300,
                    category: { name: 'Rent', color: 'blue', icon: 'home' }
                },
            ]);

            const range = DateRange.currentMonth();
            const result = await service.getSpendingByCategory('user-1', range);

            // Total 400. Food: 100 (25%), Rent: 300 (75%)
            expect(result).toHaveLength(2);
            expect(result[0].categoryName).toBe('Rent'); // Sorted desc
            expect(result[0].percentage).toBe(75);
            expect(result[1].categoryName).toBe('Food');
            expect(result[1].percentage).toBe(25);
        });
    });
    describe('getMonthlyComparison', () => {
        it('should calculate trends correctly', async () => {
            // Mock IncomeVsExpenses calls internally if possible or mock prisma responses for two periods
            // Since getMonthlyComparison calls getIncomeVsExpenses internally, we need to mock prisma.groupBy twice
            // Or better, we can spy on getIncomeVsExpenses if we want to test logic only, but here we test service integration

            // First call (Current Month)
            prisma.transaction.groupBy.mockResolvedValueOnce([
                { type: TransactionType.INCOME, _sum: { amount: 2000 } },
                { type: TransactionType.EXPENSE, _sum: { amount: 1000 } },
            ]);

            // Second call (Previous Month)
            prisma.transaction.groupBy.mockResolvedValueOnce([
                { type: TransactionType.INCOME, _sum: { amount: 1000 } },
                { type: TransactionType.EXPENSE, _sum: { amount: 500 } },
            ]);

            const result = await service.getMonthlyComparison('user-1');

            expect(result.currentMonth.income).toBe(2000);
            expect(result.previousMonth.income).toBe(1000);

            // Trends: (2000 - 1000) / 1000 * 100 = 100% increase
            expect(result.changes.incomePercentage).toBe(100);
            // Trends: (1000 - 500) / 500 * 100 = 100% increase
            expect(result.changes.expensesPercentage).toBe(100);
        });

        it('should handle zero previous values to avoid division by zero', async () => {
            // Current: 500, Previous: 0
            prisma.transaction.groupBy.mockResolvedValueOnce([
                { type: TransactionType.INCOME, _sum: { amount: 500 } },
            ]);
            prisma.transaction.groupBy.mockResolvedValueOnce([]); // Previous month empty

            const result = await service.getMonthlyComparison('user-1');

            expect(result.previousMonth.income).toBe(0);
            expect(result.changes.incomePercentage).toBe(100); // 100% growth if started from 0
        });
    });

    describe('Edge Cases', () => {
        it('should return empty array for spending by category if no data', async () => {
            prisma.transaction.findMany.mockResolvedValue([]);
            const result = await service.getSpendingByCategory('user-1', DateRange.currentMonth());
            expect(result).toEqual([]);
        });

        it('should return zeros for income vs expenses if no data', async () => {
            prisma.transaction.groupBy.mockResolvedValue([]);
            const result = await service.getIncomeVsExpenses('user-1', DateRange.currentMonth());

            expect(result.income).toBe(0);
            expect(result.expenses).toBe(0);
            expect(result.balance).toBe(0);
        });
    });
});
