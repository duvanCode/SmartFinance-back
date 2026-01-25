import { Inject, Injectable } from '@nestjs/common';
import { BaseUseCase } from '@shared/application/base.use-case';
import {
    ITransactionRepository,
    TRANSACTION_REPOSITORY,
} from '../../domain/repositories/transaction.repository.interface';
import { TransactionType } from '../../domain/enums/transaction-type.enum';

export interface GetTotalBalanceInput {
    userId: string;
}

export interface TotalBalanceDto {
    balance: number;
    totalIncome: number;
    totalExpense: number;
}

@Injectable()
export class GetTotalBalanceUseCase
    implements BaseUseCase<GetTotalBalanceInput, TotalBalanceDto> {
    constructor(
        @Inject(TRANSACTION_REPOSITORY)
        private readonly transactionRepository: ITransactionRepository,
    ) { }

    async execute(input: GetTotalBalanceInput): Promise<TotalBalanceDto> {
        const totalIncome = await this.transactionRepository.getTotalByUserIdAndType(
            input.userId,
            TransactionType.INCOME,
        );

        const totalExpense = await this.transactionRepository.getTotalByUserIdAndType(
            input.userId,
            TransactionType.EXPENSE,
        );

        const balance = totalIncome - totalExpense;

        return {
            balance: Math.round(balance * 100) / 100,
            totalIncome: Math.round(totalIncome * 100) / 100,
            totalExpense: Math.round(totalExpense * 100) / 100,
        };
    }
}
