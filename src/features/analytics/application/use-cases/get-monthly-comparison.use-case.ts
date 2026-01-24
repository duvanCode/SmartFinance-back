import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../../infrastructure/services/analytics.service';
import { MonthlyComparisonDto } from '../dto/analytics.dto';

@Injectable()
export class GetMonthlyComparisonUseCase {
    constructor(private readonly analyticsService: AnalyticsService) { }

    async execute(userId: string): Promise<MonthlyComparisonDto> {
        return this.analyticsService.getMonthlyComparison(userId);
    }
}
