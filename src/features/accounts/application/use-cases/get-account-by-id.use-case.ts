import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IAccountRepository, ACCOUNT_REPOSITORY } from '../../domain/repositories/account.repository.interface';

@Injectable()
export class GetAccountByIdUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY) private readonly accountRepository: IAccountRepository
  ) {}

  async execute(id: string, userId: string): Promise<any> {
    const account = await this.accountRepository.findById(id, userId);

    if (!account) {
        throw new NotFoundException(`Account with ID ${id} not found`);
    }

    const balance = await this.accountRepository.calculateCurrentBalance(id, userId);
    
    return {
        ...account.toPersistence(),
        balance
    };
  }
}
