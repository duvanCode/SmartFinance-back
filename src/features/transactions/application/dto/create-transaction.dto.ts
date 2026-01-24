import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDateString,
  IsUUID,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../../domain/enums/transaction-type.enum';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Category UUID for the transaction',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    description: 'Transaction amount (must be greater than 0)',
    example: 150.5,
    minimum: 0.01,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Transaction type (INCOME or EXPENSE)',
    enum: TransactionType,
    example: TransactionType.EXPENSE,
  })
  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    description: 'Transaction description',
    example: 'Monthly grocery shopping at supermarket',
    minLength: 3,
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  description: string;

  @ApiProperty({
    description: 'Transaction date in ISO 8601 format',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  date: string;
}
