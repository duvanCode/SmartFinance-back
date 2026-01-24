import { Inject, Injectable } from '@nestjs/common';
import { BaseUseCase } from '@shared/application/base.use-case';
import {
  ITransactionRepository,
  TRANSACTION_REPOSITORY,
  QueryOptions,
} from '../../domain/repositories/transaction.repository.interface';
import { TransactionResponseDto } from '../dto/transaction-response.dto';
import { TransactionType } from '../../domain/enums/transaction-type.enum';

export interface GetTransactionsInput {
  userId: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  limit?: number;
  offset?: number;
}

@Injectable()
export class GetTransactionsUseCase
  implements BaseUseCase<GetTransactionsInput, TransactionResponseDto[]>
{
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(input: GetTransactionsInput): Promise<TransactionResponseDto[]> {
    const options: QueryOptions = {
      limit: input.limit || 20,
      offset: input.offset || 0,
      orderBy: 'date',
      orderDirection: 'desc',
    };

    let transactions;

    // If date range is provided, use date range query
    if (input.startDate && input.endDate) {
      const startDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);
      // Set end date to end of day
      endDate.setHours(23, 59, 59, 999);

      transactions = await this.transactionRepository.findByUserIdAndDateRange(
        input.userId,
        startDate,
        endDate,
      );
    } else {
      // Get all transactions for user with pagination
      transactions = await this.transactionRepository.findByUserId(
        input.userId,
        options,
      );
    }

    // Filter by category if provided
    if (input.categoryId) {
      transactions = transactions.filter(
        (t) => t.categoryId === input.categoryId,
      );
    }

    // Filter by type if provided
    if (input.type) {
      transactions = transactions.filter((t) => t.type === input.type);
    }

    // Apply pagination after filtering (for date range queries)
    if (input.startDate && input.endDate) {
      const start = input.offset || 0;
      const end = start + (input.limit || 20);
      transactions = transactions.slice(start, end);
    }

    return transactions.map((transaction) =>
      TransactionResponseDto.fromEntity(transaction),
    );
  }
}
