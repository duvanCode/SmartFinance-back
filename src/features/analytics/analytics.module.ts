import { Module } from '@nestjs/common';
import { AuthModule } from '@features/auth/auth.module';
import { AnalyticsController } from './infrastructure/controllers/analytics.controller';
import { AnalyticsService } from './infrastructure/services/analytics.service';
import { GetSpendingByCategoryUseCase } from './application/use-cases/get-spending-by-category.use-case';
import { GetIncomeVsExpensesUseCase } from './application/use-cases/get-income-vs-expenses.use-case';
import { GetMonthlyComparisonUseCase } from './application/use-cases/get-monthly-comparison.use-case';
import { GetDashboardSummaryUseCase } from './application/use-cases/get-dashboard-summary.use-case';

@Module({
    imports: [AuthModule],
    controllers: [AnalyticsController],
    providers: [
        AnalyticsService,
        GetSpendingByCategoryUseCase,
        GetIncomeVsExpensesUseCase,
        GetMonthlyComparisonUseCase,
        GetDashboardSummaryUseCase,
    ],
})
export class AnalyticsModule { }
