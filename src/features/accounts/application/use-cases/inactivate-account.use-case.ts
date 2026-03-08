import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IAccountRepository, ACCOUNT_REPOSITORY } from '../../domain/repositories/account.repository.interface';

@Injectable()
export class InactivateAccountUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY) private readonly accountRepository: IAccountRepository
  ) {}

  async execute(id: string, userId: string): Promise<any> {
    const account = await this.accountRepository.findById(id, userId);

    if (!account) {
        throw new NotFoundException(`Account with ID ${id} not found`);
    }

    const transactionCount = await this.accountRepository.countTransactionsByAccountId(id);

    if (transactionCount === 0) {
        // Safe to delete completely if no transactions
        await this.accountRepository.delete(id);
        return { deleted: true };
    }

    // Soft delete / Inactivate otherwise
    account.inactivate();
    await this.accountRepository.update(account);
    return account.toPersistence();
  }
}
