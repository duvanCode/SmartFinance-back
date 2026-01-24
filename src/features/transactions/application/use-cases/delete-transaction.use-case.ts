import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { BaseUseCase } from '@shared/application/base.use-case';
import {
  ITransactionRepository,
  TRANSACTION_REPOSITORY,
} from '../../domain/repositories/transaction.repository.interface';

export interface DeleteTransactionInput {
  id: string;
  userId: string;
}

@Injectable()
export class DeleteTransactionUseCase
  implements BaseUseCase<DeleteTransactionInput, void>
{
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(input: DeleteTransactionInput): Promise<void> {
    // 1. Find transaction
    const transaction = await this.transactionRepository.findById(input.id);

    if (!transaction) {
      throw new NotFoundException(`Transaction with id "${input.id}" not found`);
    }

    // 2. Verify ownership
    if (transaction.userId !== input.userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this transaction',
      );
    }

    // 3. Delete transaction
    await this.transactionRepository.delete(input.id);
  }
}
