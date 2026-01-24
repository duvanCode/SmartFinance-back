import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
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
import { TransactionResponseDto } from '../dto/transaction-response.dto';
import { Money } from '../../domain/value-objects/money.vo';
import { TransactionDate } from '../../domain/value-objects/transaction-date.vo';

export interface UpdateTransactionInput {
  id: string;
  userId: string;
  categoryId?: string;
  amount?: number;
  description?: string;
  date?: string;
}

@Injectable()
export class UpdateTransactionUseCase
  implements BaseUseCase<UpdateTransactionInput, TransactionResponseDto>
{
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(input: UpdateTransactionInput): Promise<TransactionResponseDto> {
    // 1. Find transaction
    const transaction = await this.transactionRepository.findById(input.id);

    if (!transaction) {
      throw new NotFoundException(`Transaction with id "${input.id}" not found`);
    }

    // 2. Verify ownership
    if (transaction.userId !== input.userId) {
      throw new ForbiddenException(
        'You do not have permission to update this transaction',
      );
    }

    // 3. If updating category, validate it
    if (input.categoryId && input.categoryId !== transaction.categoryId) {
      const newCategory = await this.categoryRepository.findById(input.categoryId);

      if (!newCategory) {
        throw new NotFoundException(
          `Category with id "${input.categoryId}" not found`,
        );
      }

      if (newCategory.userId !== input.userId) {
        throw new NotFoundException(
          `Category with id "${input.categoryId}" not found`,
        );
      }

      // Verify type match
      const categoryType = newCategory.type;
      if (
        (transaction.type === 'INCOME' && categoryType !== 'INCOME') ||
        (transaction.type === 'EXPENSE' && categoryType !== 'EXPENSE')
      ) {
        throw new BadRequestException(
          `New category type "${categoryType}" does not match transaction type "${transaction.type}"`,
        );
      }
    }

    // 4. Prepare update values
    const newDescription = input.description ?? transaction.description;
    const newAmount = input.amount
      ? new Money(input.amount)
      : transaction.amount;
    const newCategoryId = input.categoryId ?? transaction.categoryId;
    const newDate = input.date
      ? new TransactionDate(input.date)
      : transaction.date;

    // 5. Update transaction
    transaction.update(newDescription, newAmount, newCategoryId, newDate);

    // 6. Persist changes
    const updatedTransaction =
      await this.transactionRepository.update(transaction);

    // 7. Return DTO
    return TransactionResponseDto.fromEntity(updatedTransaction);
  }
}
