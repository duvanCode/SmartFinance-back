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
import {
  IAccountRepository,
  ACCOUNT_REPOSITORY,
} from '@features/accounts/domain/repositories/account.repository.interface';
import { TransactionResponseDto } from '../dto/transaction-response.dto';
import { Money } from '../../domain/value-objects/money.vo';
import { TransactionDate } from '../../domain/value-objects/transaction-date.vo';

export interface UpdateTransactionInput {
  id: string;
  userId: string;
  categoryId?: string;
  accountId?: string;
  amount?: number;
  description?: string;
  date?: string;
}

@Injectable()
export class UpdateTransactionUseCase
  implements BaseUseCase<UpdateTransactionInput, TransactionResponseDto> {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
  ) { }

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

    // 3. Prevent editing loan transactions
    console.log('🔍 UPDATE TRANSACTION DEBUG:', {
      transactionId: transaction.id,
      isLoan: transaction.isLoan,
      loanId: transaction.loanId,
      description: transaction.description,
    });

    if (transaction.isLoan) {
      console.log('❌ BLOCKING: This is a loan transaction');
      throw new BadRequestException(
        'Cannot edit loan transactions directly. Please edit the loan instead.',
      );
    }

    console.log('✅ ALLOWING: This is NOT a loan transaction');

    // 4. If updating category, validate it
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

    // 5. If updating account, validate it
    if (input.accountId && input.accountId !== transaction.accountId) {
      const newAccount = await this.accountRepository.findById(input.accountId, input.userId);
      if (!newAccount) {
        throw new BadRequestException(`Account with id "${input.accountId}" not found`);
      }
      if (!newAccount.isActive) {
        throw new BadRequestException('Cannot move transaction to an inactive account');
      }
    }

    // 6. Prepare update values
    const newDescription = input.description ?? transaction.description;
    const newAmount = input.amount
      ? new Money(input.amount)
      : transaction.amount;
    const newCategoryId = input.categoryId ?? transaction.categoryId;
    const newAccountId = input.accountId ?? transaction.accountId;
    const newDate = input.date
      ? new TransactionDate(input.date)
      : transaction.date;

    // 7. Update transaction
    transaction.update(newDescription, newAmount, newCategoryId, newAccountId, newDate);

    // 8. Persist changes
    const updatedTransaction =
      await this.transactionRepository.update(transaction);

    // 9. Return DTO
    return TransactionResponseDto.fromEntity(updatedTransaction);
  }
}
