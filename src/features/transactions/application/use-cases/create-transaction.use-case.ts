import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BaseUseCase } from '@shared/application/base.use-case';
import {
  ITransactionRepository,
  TRANSACTION_REPOSITORY,
} from '../../domain/repositories/transaction.repository.interface';
import {
  ICategoryRepository,
  CATEGORY_REPOSITORY,
} from '@features/categories/domain/repositories/category.repository.interface';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionResponseDto } from '../dto/transaction-response.dto';
import { TransactionType } from '../../domain/enums/transaction-type.enum';
import { InputSource } from '../../domain/enums/input-source.enum';

export interface CreateTransactionInput {
  userId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
  source?: InputSource;
  rawInput?: string;
  aiConfidence?: number;
}

@Injectable()
export class CreateTransactionUseCase
  implements BaseUseCase<CreateTransactionInput, TransactionResponseDto>
{
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(input: CreateTransactionInput): Promise<TransactionResponseDto> {
    // 1. Verify category exists
    const category = await this.categoryRepository.findById(input.categoryId);
    if (!category) {
      throw new NotFoundException(
        `Category with id "${input.categoryId}" not found`,
      );
    }

    // 2. Verify category belongs to user
    if (category.userId !== input.userId) {
      throw new NotFoundException(
        `Category with id "${input.categoryId}" not found`,
      );
    }

    // 3. Verify transaction type matches category type
    const categoryType = category.type;
    if (
      (input.type === TransactionType.INCOME && categoryType !== 'INCOME') ||
      (input.type === TransactionType.EXPENSE && categoryType !== 'EXPENSE')
    ) {
      throw new BadRequestException(
        `Transaction type "${input.type}" does not match category type "${categoryType}"`,
      );
    }

    // 4. Create transaction entity
    const transaction = Transaction.create(
      input.userId,
      input.categoryId,
      input.amount,
      input.type,
      input.description,
      input.date,
      input.source || InputSource.MANUAL,
      input.rawInput,
      input.aiConfidence,
    );

    // 5. Persist transaction
    const createdTransaction =
      await this.transactionRepository.create(transaction);

    // 6. Return DTO
    return TransactionResponseDto.fromEntity(createdTransaction);
  }
}
