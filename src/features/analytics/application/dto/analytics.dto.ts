import { ApiProperty } from '@nestjs/swagger';

export class SpendingByCategoryDto {
    @ApiProperty()
    categoryId: string;

    @ApiProperty()
    categoryName: string;

    @ApiProperty()
    categoryColor: string;

    @ApiProperty()
    categoryIcon: string;

    @ApiProperty({ description: 'Total amount spent in this category' })
    amount: number;

    @ApiProperty({ description: 'Percentage of total expenses' })
    percentage: number;
}

export class IncomeVsExpensesDto {
    @ApiProperty()
    income: number;

    @ApiProperty()
    expenses: number;

    @ApiProperty()
    balance: number;
}

export class MonthlyComparisonDto {
    @ApiProperty()
    currentMonth: IncomeVsExpensesDto;

    @ApiProperty()
    previousMonth: IncomeVsExpensesDto;

    @ApiProperty()
    changes: {
        incomePercentage: number;
        expensesPercentage: number;
        balancePercentage: number;
    };
}
