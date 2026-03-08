import { Account } from '../entities/account.entity';
import { AccountType } from '../enums/account-type.enum';

export interface IAccountRepository {
  findById(id: string, userId: string): Promise<Account | null>;
  findByUserId(userId: string): Promise<Account[]>;
  create(account: Account): Promise<Account>;
  update(account: Account): Promise<Account>;
  delete(id: string): Promise<void>;
  
  // Custom queries needed for business logic
  calculateCurrentBalance(accountId: string, userId: string): Promise<number>;
  recalculateSnapshot(accountId: string, userId: string): Promise<number>;
  countTransactionsByAccountId(accountId: string): Promise<number>;
  findSystemAccount(userId: string): Promise<Account | null>;
  createInitialDebtTransaction(
    userId: string, 
    accountId: string, 
    amount: number, 
    currency: string
  ): Promise<void>;
  assignOrphanTransactionsToAccount(userId: string, targetAccountId: string): Promise<number>;
}

export const ACCOUNT_REPOSITORY = Symbol('ACCOUNT_REPOSITORY');
