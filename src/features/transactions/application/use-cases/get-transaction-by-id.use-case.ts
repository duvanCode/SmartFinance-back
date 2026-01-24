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
import { TransactionResponseDto } from '../dto/transaction-response.dto';

export interface GetTransactionByIdInput {
  id: string;
  userId: string;
}

@Injectable()
export class GetTransactionByIdUseCase
  implements BaseUseCase<GetTransactionByIdInput, TransactionResponseDto>
{
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(input: GetTransactionByIdInput): Promise<TransactionResponseDto> {
    // 1. Find transaction by ID
    const transaction = await this.transactionRepository.findById(input.id);

    if (!transaction) {
      throw new NotFoundException(`Transaction with id "${input.id}" not found`);
    }

    // 2. Security check - verify transaction belongs to user
    if (transaction.userId !== input.userId) {
      throw new ForbiddenException(
        'You do not have permission to access this transaction',
      );
    }

    // 3. Return DTO
    return TransactionResponseDto.fromEntity(transaction);
  }
}
