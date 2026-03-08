import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IAccountRepository, ACCOUNT_REPOSITORY } from '../../domain/repositories/account.repository.interface';
import { getAccountTypeFromString } from '../../domain/enums/account-type.enum';

interface UpdateAccountInput {
  name?: string;
  type?: string;
  currency?: string;
  isActive?: boolean;
  bankName?: string;
  accountNumber?: string;
  creditLimit?: number;
  cutoffDate?: number;
  paymentDate?: number;
}

@Injectable()
export class UpdateAccountUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY) private readonly accountRepository: IAccountRepository
  ) {}

  async execute(id: string, userId: string, input: UpdateAccountInput): Promise<any> {
    const account = await this.accountRepository.findById(id, userId);

    if (!account) {
        throw new NotFoundException(`Account with ID ${id} not found`);
    }

    account.update({
        ...input,
        type: input.type ? getAccountTypeFromString(input.type) : undefined
    });

    const updatedAccount = await this.accountRepository.update(account);

    return updatedAccount.toPersistence();
  }
}
