import { Injectable, Inject } from '@nestjs/common';
import { IAccountRepository, ACCOUNT_REPOSITORY } from '../../domain/repositories/account.repository.interface';
import { Account } from '../../domain/entities/account.entity';
import { AccountType, getAccountTypeFromString } from '../../domain/enums/account-type.enum';

interface CreateAccountInput {
  userId: string;
  name: string;
  type: string;
  currency?: string;
  bankName?: string;
  accountNumber?: string;
  creditLimit?: number;
  cutoffDate?: number;
  paymentDate?: number;
  initialDebt?: number;
}

@Injectable()
export class CreateAccountUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY) private readonly accountRepository: IAccountRepository
  ) {}

  async execute(input: CreateAccountInput): Promise<any> {
    const type = getAccountTypeFromString(input.type);

    const newAccount = Account.create({
      userId: input.userId,
      name: input.name,
      type,
      currency: input.currency || 'COP',
      bankName: input.bankName,
      accountNumber: input.accountNumber,
      creditLimit: input.creditLimit,
      cutoffDate: input.cutoffDate,
      paymentDate: input.paymentDate,
      initialDebt: input.initialDebt
    });

    const savedAccount = await this.accountRepository.create(newAccount);

    // Initial debt logic for credit cards
    if (type === AccountType.CREDIT_CARD && input.initialDebt && input.initialDebt > 0) {
      await this.accountRepository.createInitialDebtTransaction(
        input.userId,
        savedAccount.id,
        input.initialDebt,
        savedAccount.currency || 'COP'
      );
    }

    return savedAccount.toPersistence();
  }
}
