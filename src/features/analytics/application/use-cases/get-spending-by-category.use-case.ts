import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../../infrastructure/services/analytics.service';
import { DateRange } from '../../domain/value-objects/date-range.vo';
import { SpendingByCategoryDto } from '../dto/analytics.dto';

export interface GetSpendingByCategoryInput {
    userId: string;
    startDate?: string;
    endDate?: string;
}

@Injectable()
export class GetSpendingByCategoryUseCase {
    constructor(private readonly analyticsService: AnalyticsService) { }

    async execute(input: GetSpendingByCategoryInput): Promise<SpendingByCategoryDto[]> {
        const range = input.startDate && input.endDate
            ? DateRange.fromDates(input.startDate, input.endDate)
            : DateRange.currentMonth();

        return this.analyticsService.getSpendingByCategory(input.userId, range);
    }
}
