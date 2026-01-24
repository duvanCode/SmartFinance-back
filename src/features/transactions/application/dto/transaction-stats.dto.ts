import { ApiProperty } from '@nestjs/swagger';

export class PeriodDto {
  @ApiProperty({
    description: 'Start date of the period',
    example: '2024-01-01',
  })
  startDate: string;

  @ApiProperty({
    description: 'End date of the period',
    example: '2024-01-31',
  })
  endDate: string;
}

export class TransactionStatsDto {
  @ApiProperty({
    description: 'Total income in the period',
    example: 5000.0,
  })
  totalIncome: number;

  @ApiProperty({
    description: 'Total expenses in the period',
    example: 3500.0,
  })
  totalExpense: number;

  @ApiProperty({
    description: 'Balance (income - expense)',
    example: 1500.0,
  })
  balance: number;

  @ApiProperty({
    description: 'Total number of transactions in the period',
    example: 45,
  })
  transactionCount: number;

  @ApiProperty({
    description: 'Average income per transaction',
    example: 500.0,
  })
  averageIncome: number;

  @ApiProperty({
    description: 'Average expense per transaction',
    example: 100.0,
  })
  averageExpense: number;

  @ApiProperty({
    description: 'Period information',
    type: PeriodDto,
  })
  period: PeriodDto;

  constructor(data: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
    averageIncome: number;
    averageExpense: number;
    period: PeriodDto;
  }) {
    this.totalIncome = data.totalIncome;
    this.totalExpense = data.totalExpense;
    this.balance = data.balance;
    this.transactionCount = data.transactionCount;
    this.averageIncome = data.averageIncome;
    this.averageExpense = data.averageExpense;
    this.period = data.period;
  }
}
