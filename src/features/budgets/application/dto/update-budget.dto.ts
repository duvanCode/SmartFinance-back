import { IsEnum, IsNumber, IsOptional, Max, Min, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BudgetPeriod } from '../../domain/enums/budget-period.enum';

export class UpdateBudgetDto {
    @ApiPropertyOptional({
        description: 'New budget name',
        example: 'New Name',
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({
        description: 'New color tag (hex code)',
        example: '#10B981',
    })
    @IsOptional()
    @IsString()
    color?: string;

    @ApiPropertyOptional({
        description: 'New category IDs',
        example: ['550e8400-e29b-41d4-a716-446655440000'],
        type: [String],
    })
    @IsOptional()
    @IsUUID('4', { each: true })
    categoryIds?: string[];
    @ApiPropertyOptional({
        description: 'New budget amount limit',
        example: 600.00,
        minimum: 0.01,
        maximum: 99999999.99,
    })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    @Max(99999999.99)
    amount?: number;

    @ApiPropertyOptional({
        description: 'New budget period',
        enum: BudgetPeriod,
        example: BudgetPeriod.WEEKLY,
    })
    @IsOptional()
    @IsEnum(BudgetPeriod)
    period?: BudgetPeriod;
}
