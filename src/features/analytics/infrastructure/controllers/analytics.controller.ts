import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/infrastructure/guards/jwt-auth.guard';
import { GetSpendingByCategoryUseCase } from '../../application/use-cases/get-spending-by-category.use-case';
import { GetIncomeVsExpensesUseCase } from '../../application/use-cases/get-income-vs-expenses.use-case';
import { GetMonthlyComparisonUseCase } from '../../application/use-cases/get-monthly-comparison.use-case';
import { GetDashboardSummaryUseCase } from '../../application/use-cases/get-dashboard-summary.use-case';
import { SpendingByCategoryDto, IncomeVsExpensesDto, MonthlyComparisonDto } from '../../application/dto/analytics.dto';

interface RequestWithUser extends Request {
    user: {
        userId: string;
        email: string;
    };
}

@ApiTags('Analytics')
@ApiBearerAuth('JWT-auth')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
    constructor(
        private readonly getSpendingByCategoryUseCase: GetSpendingByCategoryUseCase,
        private readonly getIncomeVsExpensesUseCase: GetIncomeVsExpensesUseCase,
        private readonly getMonthlyComparisonUseCase: GetMonthlyComparisonUseCase,
        private readonly getDashboardSummaryUseCase: GetDashboardSummaryUseCase,
    ) { }

    @Get('spending-by-category')
    @ApiOperation({ summary: 'Get spending breakdown by category' })
    @ApiQuery({ name: 'startDate', required: false, type: String })
    @ApiQuery({ name: 'endDate', required: false, type: String })
    @ApiResponse({ status: 200, type: [SpendingByCategoryDto] })
    async getSpendingByCategory(
        @Request() req: RequestWithUser,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ): Promise<SpendingByCategoryDto[]> {
        return this.getSpendingByCategoryUseCase.execute({
            userId: req.user.userId,
            startDate,
            endDate,
        });
    }

    @Get('income-vs-expenses')
    @ApiOperation({ summary: 'Get income vs expenses summary' })
    @ApiQuery({ name: 'startDate', required: false, type: String })
    @ApiQuery({ name: 'endDate', required: false, type: String })
    @ApiResponse({ status: 200, type: IncomeVsExpensesDto })
    async getIncomeVsExpenses(
        @Request() req: RequestWithUser,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ): Promise<IncomeVsExpensesDto> {
        return this.getIncomeVsExpensesUseCase.execute({
            userId: req.user.userId,
            startDate,
            endDate,
        });
    }

    @Get('monthly-comparison')
    @ApiOperation({ summary: 'Get comparison between current and previous month' })
    @ApiResponse({ status: 200, type: MonthlyComparisonDto })
    async getMonthlyComparison(@Request() req: RequestWithUser): Promise<MonthlyComparisonDto> {
        return this.getMonthlyComparisonUseCase.execute(req.user.userId);
    }

    @Get('summary')
    @ApiOperation({ summary: 'Get dashboard summary with real balance and loans' })
    async getDashboardSummary(@Request() req: RequestWithUser) {
        return this.getDashboardSummaryUseCase.execute(req.user.userId);
    }
}
