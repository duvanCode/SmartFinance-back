import { Injectable, Inject } from '@nestjs/common';
import { IAccountRepository, ACCOUNT_REPOSITORY } from '../../domain/repositories/account.repository.interface';

@Injectable()
export class GetAccountsByUserIdUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY) private readonly accountRepository: IAccountRepository
  ) {}

  async execute(userId: string): Promise<any[]> {
    const accounts = await this.accountRepository.findByUserId(userId);
    
    // Calculate current balances using the snapshot logic in repository
    const accountsWithBalances = await Promise.all(
        accounts.map(async (account) => {
            const balance = await this.accountRepository.calculateCurrentBalance(account.id, userId);
            const data = account.toPersistence();
            return {
                ...data,
                balance
            };
        })
    );
    
    return accountsWithBalances;
  }
}
