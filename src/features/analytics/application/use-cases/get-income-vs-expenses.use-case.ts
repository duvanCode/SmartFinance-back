import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../../infrastructure/services/analytics.service';
import { DateRange } from '../../domain/value-objects/date-range.vo';
import { IncomeVsExpensesDto } from '../dto/analytics.dto';

export interface GetIncomeVsExpensesInput {
    userId: string;
    startDate?: string;
    endDate?: string;
}

@Injectable()
export class GetIncomeVsExpensesUseCase {
    constructor(private readonly analyticsService: AnalyticsService) { }

    async execute(input: GetIncomeVsExpensesInput): Promise<IncomeVsExpensesDto> {
        const range = input.startDate && input.endDate
            ? DateRange.fromDates(input.startDate, input.endDate)
            : DateRange.currentMonth();

        return this.analyticsService.getIncomeVsExpenses(input.userId, range);
    }
}
