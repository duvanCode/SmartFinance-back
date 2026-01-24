import { Test, TestingModule } from '@nestjs/testing';
import { GetSpendingByCategoryUseCase } from './get-spending-by-category.use-case';
import { AnalyticsService } from '../../infrastructure/services/analytics.service';
import { DateRange } from '../../domain/value-objects/date-range.vo';

describe('GetSpendingByCategoryUseCase', () => {
    let useCase: GetSpendingByCategoryUseCase;
    let service: any;

    beforeEach(async () => {
        service = { getSpendingByCategory: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetSpendingByCategoryUseCase,
                { provide: AnalyticsService, useValue: service },
            ],
        }).compile();

        useCase = module.get<GetSpendingByCategoryUseCase>(GetSpendingByCategoryUseCase);
    });

    it('should call service with correct params including dates', async () => {
        const input = {
            userId: 'user-1',
            startDate: '2024-01-01',
            endDate: '2024-01-31'
        };

        await useCase.execute(input);

        expect(service.getSpendingByCategory).toHaveBeenCalledWith(
            'user-1',
            expect.any(DateRange)
        );
        // Verify DateRange values
        const callArgs = service.getSpendingByCategory.mock.calls[0];
        const range = callArgs[1] as DateRange;
        expect(range.startDate).toEqual(new Date('2024-01-01'));
        // endDate handles time, so we just check it was created
        expect(range.endDate.toISOString()).toContain('2024-01-31');
    });

    it('should default to current month if no dates provided', async () => {
        await useCase.execute({ userId: 'user-1' });

        expect(service.getSpendingByCategory).toHaveBeenCalledWith(
            'user-1',
            expect.any(DateRange)
        );
    });
});
