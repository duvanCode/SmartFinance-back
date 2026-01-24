import { Test, TestingModule } from '@nestjs/testing';
import { GetMonthlyComparisonUseCase } from './get-monthly-comparison.use-case';
import { AnalyticsService } from '../../infrastructure/services/analytics.service';

describe('GetMonthlyComparisonUseCase', () => {
    let useCase: GetMonthlyComparisonUseCase;
    let service: any;

    beforeEach(async () => {
        service = { getMonthlyComparison: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetMonthlyComparisonUseCase,
                { provide: AnalyticsService, useValue: service },
            ],
        }).compile();

        useCase = module.get<GetMonthlyComparisonUseCase>(GetMonthlyComparisonUseCase);
    });

    it('should call service with correct userId', async () => {
        await useCase.execute('user-1');
        expect(service.getMonthlyComparison).toHaveBeenCalledWith('user-1');
    });
});
