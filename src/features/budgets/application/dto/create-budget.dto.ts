import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, Max, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BudgetPeriod } from '../../domain/enums/budget-period.enum';

export class CreateBudgetDto {
  @ApiProperty({
    description: 'Budget name',
    example: 'Monthly Groceries',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Color tag (hex code)',
    example: '#3B82F6',
  })
  @IsNotEmpty()
  @IsString()
  color: string;

  @ApiProperty({
    description: 'Category IDs included in the budget',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    type: [String],
  })
  @IsNotEmpty()
  @IsUUID('4', { each: true })
  categoryIds: string[];

  @ApiProperty({
    description: 'Budget amount limit',
    example: 500.00,
    minimum: 0.01,
    maximum: 99999999.99,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(99999999.99)
  amount: number;

  @ApiProperty({
    description: 'Budget period',
    enum: BudgetPeriod,
    example: BudgetPeriod.MONTHLY,
  })
  @IsNotEmpty()
  @IsEnum(BudgetPeriod)
  period: BudgetPeriod;

  @ApiPropertyOptional({
    description: 'Custom start date for the budget',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Custom end date for the budget',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: Date;
}
