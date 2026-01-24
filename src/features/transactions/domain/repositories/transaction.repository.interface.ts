import { Transaction } from '../entities/transaction.entity';
import { TransactionType } from '../enums/transaction-type.enum';

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: 'date' | 'amount' | 'createdAt';
  orderDirection?: 'asc' | 'desc';
}

export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findByUserId(userId: string, options?: QueryOptions): Promise<Transaction[]>;
  findByCategoryId(categoryId: string): Promise<Transaction[]>;
  findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Transaction[]>;
  create(transaction: Transaction): Promise<Transaction>;
  update(transaction: Transaction): Promise<Transaction>;
  delete(id: string): Promise<void>;
  getTotalByUserIdAndType(userId: string, type: TransactionType): Promise<number>;
  getTotalByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    type?: TransactionType,
  ): Promise<number>;
  countByUserId(userId: string): Promise<number>;
}

export const TRANSACTION_REPOSITORY = Symbol('TRANSACTION_REPOSITORY');
