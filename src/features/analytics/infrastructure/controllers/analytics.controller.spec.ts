import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { GetSpendingByCategoryUseCase } from '../../application/use-cases/get-spending-by-category.use-case';
import { GetIncomeVsExpensesUseCase } from '../../application/use-cases/get-income-vs-expenses.use-case';
import { GetMonthlyComparisonUseCase } from '../../application/use-cases/get-monthly-comparison.use-case';
import { SpendingByCategoryDto, IncomeVsExpensesDto, MonthlyComparisonDto } from '../../application/dto/analytics.dto';

describe('AnalyticsController', () => {
    let controller: AnalyticsController;
    let getSpendingByCategoryUseCase: any;
    let getIncomeVsExpensesUseCase: any;
    let getMonthlyComparisonUseCase: any;

    beforeEach(async () => {
        getSpendingByCategoryUseCase = { execute: jest.fn() };
        getIncomeVsExpensesUseCase = { execute: jest.fn() };
        getMonthlyComparisonUseCase = { execute: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AnalyticsController],
            providers: [
                { provide: GetSpendingByCategoryUseCase, useValue: getSpendingByCategoryUseCase },
                { provide: GetIncomeVsExpensesUseCase, useValue: getIncomeVsExpensesUseCase },
                { provide: GetMonthlyComparisonUseCase, useValue: getMonthlyComparisonUseCase },
            ],
        }).compile();

        controller = module.get<AnalyticsController>(AnalyticsController);
    });

    describe('getSpendingByCategory', () => {
        it('should return spending by category', async () => {
            const result: SpendingByCategoryDto[] = [{
                categoryId: '1',
                categoryName: 'Food',
                categoryColor: '#fff',
                categoryIcon: 'food',
                amount: 100,
                percentage: 50
            }];

            getSpendingByCategoryUseCase.execute.mockResolvedValue(result);

            const req = { user: { userId: 'user-1' } };
            expect(await controller.getSpendingByCategory(req as any, '2024-01-01', '2024-01-31')).toBe(result);
            expect(getSpendingByCategoryUseCase.execute).toHaveBeenCalledWith({
                userId: 'user-1',
                startDate: '2024-01-01',
                endDate: '2024-01-31'
            });
        });
    });

    describe('getIncomeVsExpenses', () => {
        it('should return income vs expenses', async () => {
            const result: IncomeVsExpensesDto = { income: 1000, expenses: 500, balance: 500 };

            getIncomeVsExpensesUseCase.execute.mockResolvedValue(result);

            const req = { user: { userId: 'user-1' } };
            expect(await controller.getIncomeVsExpenses(req as any)).toBe(result);
            expect(getIncomeVsExpensesUseCase.execute).toHaveBeenCalledWith({
                userId: 'user-1',
                startDate: undefined,
                endDate: undefined
            });
        });
    });

    describe('getMonthlyComparison', () => {
        it('should return monthly comparison', async () => {
            const result: MonthlyComparisonDto = {
                currentMonth: { income: 100, expenses: 50, balance: 50 },
                previousMonth: { income: 80, expenses: 40, balance: 40 },
                changes: { incomePercentage: 25, expensesPercentage: 25, balancePercentage: 25 }
            };

            getMonthlyComparisonUseCase.execute.mockResolvedValue(result);

            const req = { user: { userId: 'user-1' } };
            expect(await controller.getMonthlyComparison(req as any)).toBe(result);
            expect(getMonthlyComparisonUseCase.execute).toHaveBeenCalledWith('user-1');
        });
    });
});
