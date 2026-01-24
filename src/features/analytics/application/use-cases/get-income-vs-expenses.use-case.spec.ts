import { Test, TestingModule } from '@nestjs/testing';
import { GetIncomeVsExpensesUseCase } from './get-income-vs-expenses.use-case';
import { AnalyticsService } from '../../infrastructure/services/analytics.service';
import { DateRange } from '../../domain/value-objects/date-range.vo';

describe('GetIncomeVsExpensesUseCase', () => {
    let useCase: GetIncomeVsExpensesUseCase;
    let service: any;

    beforeEach(async () => {
        service = { getIncomeVsExpenses: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetIncomeVsExpensesUseCase,
                { provide: AnalyticsService, useValue: service },
            ],
        }).compile();

        useCase = module.get<GetIncomeVsExpensesUseCase>(GetIncomeVsExpensesUseCase);
    });

    it('should call service with correct params', async () => {
        const input = {
            userId: 'user-1',
            startDate: '2024-01-01',
            endDate: '2024-01-31'
        };

        await useCase.execute(input);

        expect(service.getIncomeVsExpenses).toHaveBeenCalledWith(
            'user-1',
            expect.any(DateRange)
        );
    });
});
