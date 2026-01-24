import { Inject, Injectable } from '@nestjs/common';
import { BaseUseCase } from '@shared/application/base.use-case';
import {
  ITransactionRepository,
  TRANSACTION_REPOSITORY,
} from '../../domain/repositories/transaction.repository.interface';
import { TransactionStatsDto } from '../dto/transaction-stats.dto';
import { TransactionType } from '../../domain/enums/transaction-type.enum';

export interface GetTransactionStatsInput {
  userId: string;
  startDate: string;
  endDate: string;
}

@Injectable()
export class GetTransactionStatsUseCase
  implements BaseUseCase<GetTransactionStatsInput, TransactionStatsDto>
{
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(input: GetTransactionStatsInput): Promise<TransactionStatsDto> {
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);
    // Set end date to end of day
    endDate.setHours(23, 59, 59, 999);

    // Get total income
    const totalIncome = await this.transactionRepository.getTotalByUserIdAndDateRange(
      input.userId,
      startDate,
      endDate,
      TransactionType.INCOME,
    );

    // Get total expense
    const totalExpense = await this.transactionRepository.getTotalByUserIdAndDateRange(
      input.userId,
      startDate,
      endDate,
      TransactionType.EXPENSE,
    );

    // Calculate balance
    const balance = totalIncome - totalExpense;

    // Get transactions for counting
    const transactions = await this.transactionRepository.findByUserIdAndDateRange(
      input.userId,
      startDate,
      endDate,
    );

    const transactionCount = transactions.length;

    // Count income and expense transactions separately
    const incomeTransactions = transactions.filter((t) => t.isIncome());
    const expenseTransactions = transactions.filter((t) => t.isExpense());

    // Calculate averages
    const averageIncome =
      incomeTransactions.length > 0
        ? totalIncome / incomeTransactions.length
        : 0;

    const averageExpense =
      expenseTransactions.length > 0
        ? totalExpense / expenseTransactions.length
        : 0;

    return new TransactionStatsDto({
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpense: Math.round(totalExpense * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      transactionCount,
      averageIncome: Math.round(averageIncome * 100) / 100,
      averageExpense: Math.round(averageExpense * 100) / 100,
      period: {
        startDate: input.startDate,
        endDate: input.endDate,
      },
    });
  }
}
