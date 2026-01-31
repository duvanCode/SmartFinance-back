import { ApiProperty } from '@nestjs/swagger';

export class BudgetStatusDto {
    @ApiProperty({
        description: 'Budget ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    budgetId: string;



    @ApiProperty({
        description: 'Total budget amount',
        example: 1000.00,
    })
    budgetAmount: number;

    @ApiProperty({
        description: 'Total amount spent in the current period',
        example: 450.50,
    })
    spentAmount: number;

    @ApiProperty({
        description: 'Remaining amount allowed to spend',
        example: 549.50,
    })
    remainingAmount: number;

    @ApiProperty({
        description: 'Percentage of budget used',
        example: 45.05,
    })
    percentageUsed: number;

    @ApiProperty({
        description: 'Whether the budget limit has been exceeded',
        example: false,
    })
    isExceeded: boolean;

    @ApiProperty({
        description: 'Alert level based on usage',
        enum: ['normal', 'warning', 'danger', 'exceeded'],
        example: 'normal',
    })
    alertLevel: 'normal' | 'warning' | 'danger' | 'exceeded';

    @ApiProperty({
        description: 'Start date of the current period',
        example: '2024-01-01T00:00:00Z',
    })
    periodStart: Date;

    @ApiProperty({
        description: 'End date of the current period',
        example: '2024-01-31T23:59:59Z',
    })
    periodEnd: Date;

    constructor(data: BudgetStatusDto) {
        Object.assign(this, data);
    }
}
