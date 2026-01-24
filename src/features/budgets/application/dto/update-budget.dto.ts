import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BudgetPeriod } from '../../domain/enums/budget-period.enum';

export class UpdateBudgetDto {
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
