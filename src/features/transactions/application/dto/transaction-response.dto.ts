import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../../domain/enums/transaction-type.enum';
import { InputSource } from '../../domain/enums/input-source.enum';

export class TransactionResponseDto {
  @ApiProperty({
    description: 'Transaction unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who owns this transaction',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  userId: string;

  @ApiProperty({
    description: 'Category ID for this transaction',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  categoryId: string;

  @ApiProperty({
    description: 'Transaction amount',
    example: 150.5,
  })
  amount: number;

  @ApiProperty({
    description: 'Transaction type',
    enum: TransactionType,
    example: TransactionType.EXPENSE,
  })
  type: TransactionType;

  @ApiProperty({
    description: 'Transaction description',
    example: 'Monthly grocery shopping at supermarket',
  })
  description: string;

  @ApiProperty({
    description: 'Transaction date',
    example: '2024-01-15T10:30:00.000Z',
  })
  date: Date;

  @ApiProperty({
    description: 'Input source (MANUAL, AI_TEXT, AI_AUDIO)',
    enum: InputSource,
    example: InputSource.MANUAL,
  })
  source: InputSource;

  @ApiProperty({
    description: 'Original raw input for AI-processed transactions',
    example: 'Spent 50 dollars on lunch',
    required: false,
  })
  rawInput?: string;

  @ApiProperty({
    description: 'AI confidence level for categorization (0-1)',
    example: 0.95,
    required: false,
  })
  aiConfidence?: number;

  @ApiProperty({
    description: 'Transaction creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Transaction last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;

  constructor(data: {
    id: string;
    userId: string;
    categoryId: string;
    amount: number;
    type: TransactionType;
    description: string;
    date: Date;
    source: InputSource;
    rawInput?: string;
    aiConfidence?: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.userId = data.userId;
    this.categoryId = data.categoryId;
    this.amount = data.amount;
    this.type = data.type;
    this.description = data.description;
    this.date = data.date;
    this.source = data.source;
    this.rawInput = data.rawInput;
    this.aiConfidence = data.aiConfidence;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static fromEntity(transaction: {
    id: string;
    userId: string;
    categoryId: string;
    amount: { toNumber: () => number };
    type: TransactionType;
    description: string;
    date: { getValue: () => Date };
    source: InputSource;
    rawInput?: string;
    aiConfidence?: number;
    createdAt: Date;
    updatedAt: Date;
  }): TransactionResponseDto {
    return new TransactionResponseDto({
      id: transaction.id,
      userId: transaction.userId,
      categoryId: transaction.categoryId,
      amount: transaction.amount.toNumber(),
      type: transaction.type,
      description: transaction.description,
      date: transaction.date.getValue(),
      source: transaction.source,
      rawInput: transaction.rawInput,
      aiConfidence: transaction.aiConfidence,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    });
  }
}
