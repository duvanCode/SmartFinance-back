import {
    Inject,
    Injectable,
    BadRequestException,
} from '@nestjs/common';
import { BaseUseCase } from '@shared/application/base.use-case';
import {
  IAccountRepository,
  ACCOUNT_REPOSITORY,
} from '@features/accounts/domain/repositories/account.repository.interface';
import { CreateTransactionUseCase } from './create-transaction.use-case';
import { TransactionResponseDto } from '../dto/transaction-response.dto';
import { TransactionType } from '../../domain/enums/transaction-type.enum';
import { InputSource } from '../../domain/enums/input-source.enum';

export interface CreateTransferInput {
    userId: string;
    sourceAccountId: string;
    destinationAccountId: string;
    sourceCategoryId: string;
    destinationCategoryId: string;
    amount: number;
    description: string;
    date: string;
}

@Injectable()
export class CreateTransferUseCase
    implements BaseUseCase<CreateTransferInput, TransactionResponseDto[]> {
    constructor(
        private readonly createTransactionUseCase: CreateTransactionUseCase,
        @Inject(ACCOUNT_REPOSITORY)
        private readonly accountRepository: IAccountRepository,
    ) { }

    async execute(input: CreateTransferInput): Promise<TransactionResponseDto[]> {
        if (input.sourceAccountId === input.destinationAccountId) {
            throw new BadRequestException('Source and destination accounts must be different');
        }

        // 1. Verify accounts exist and are active
        const sourceAccount = await this.accountRepository.findById(input.sourceAccountId, input.userId);
        const destAccount = await this.accountRepository.findById(input.destinationAccountId, input.userId);

        if (!sourceAccount || !destAccount) {
            throw new BadRequestException('Source and destination accounts must exist');
        }

        if (!sourceAccount.isActive || !destAccount.isActive) {
            throw new BadRequestException('Both accounts must be active to perform a transfer');
        }

        // 2. Generate transfer group ID
        const transferGroupId = `transfer-${crypto.randomUUID()}`;

        // 3. Create Expense transaction on source account
        const sourceTransaction = await this.createTransactionUseCase.execute({
            userId: input.userId,
            categoryId: input.sourceCategoryId,
            accountId: input.sourceAccountId,
            amount: input.amount,
            type: TransactionType.EXPENSE,
            description: input.description,
            date: input.date,
            source: InputSource.MANUAL,
            transferGroupId,
        });

        // 4. Create Income transaction on destination account
        const destTransaction = await this.createTransactionUseCase.execute({
            userId: input.userId,
            categoryId: input.destinationCategoryId,
            accountId: input.destinationAccountId,
            amount: input.amount,
            type: TransactionType.INCOME,
            description: input.description,
            date: input.date,
            source: InputSource.MANUAL,
            transferGroupId,
        });

        return [sourceTransaction, destTransaction];
    }
}
