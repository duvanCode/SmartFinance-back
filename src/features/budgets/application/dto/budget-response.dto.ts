import { ApiProperty } from '@nestjs/swagger';
import { BudgetPeriod } from '../../domain/enums/budget-period.enum';

export class BudgetResponseDto {
    @ApiProperty({
        description: 'Budget unique identifier',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    id: string;

    @ApiProperty({
        description: 'User ID who owns this budget',
        example: 'user-123',
    })
    userId: string;

    @ApiProperty({
        description: 'Category ID associated with this budget',
        example: 'category-123',
    })
    categoryId: string;

    @ApiProperty({
        description: 'Budget amount limit',
        example: 500.00,
    })
    amount: number;

    @ApiProperty({
        description: 'Budget period',
        enum: BudgetPeriod,
        example: BudgetPeriod.MONTHLY,
    })
    period: BudgetPeriod;

    @ApiProperty({
        description: 'Budget start date',
        example: '2024-01-01T00:00:00Z',
        required: false,
        nullable: true,
    })
    startDate?: Date;

    @ApiProperty({
        description: 'Budget end date',
        example: '2024-01-31T23:59:59Z',
        required: false,
        nullable: true,
    })
    endDate?: Date;

    @ApiProperty({
        description: 'Whether the budget is active',
        example: true,
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2024-01-01T10:00:00Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2024-01-01T10:00:00Z',
    })
    updatedAt: Date;

    constructor(data: {
        id: string;
        userId: string;
        categoryId: string;
        amount: number;
        period: BudgetPeriod;
        startDate?: Date;
        endDate?: Date;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }) {
        this.id = data.id;
        this.userId = data.userId;
        this.categoryId = data.categoryId;
        this.amount = data.amount;
        this.period = data.period;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.isActive = data.isActive;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}
