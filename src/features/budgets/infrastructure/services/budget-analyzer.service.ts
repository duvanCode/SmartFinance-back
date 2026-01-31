import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
    IBudgetRepository,
    BUDGET_REPOSITORY,
} from '../../domain/repositories/budget.repository.interface';
import {
    ITransactionRepository,
    TRANSACTION_REPOSITORY,
} from '../../../transactions/domain/repositories/transaction.repository.interface';
import { BudgetStatusDto } from '../../application/dto/budget-status.dto';
import { TransactionType } from '../../../transactions/domain/enums/transaction-type.enum';

@Injectable()
export class BudgetAnalyzerService {
    constructor(
        @Inject(BUDGET_REPOSITORY)
        private readonly budgetRepository: IBudgetRepository,
        @Inject(TRANSACTION_REPOSITORY)
        private readonly transactionRepository: ITransactionRepository,
    ) { }

    async calculateBudgetProgress(budgetId: string): Promise<BudgetStatusDto> {
        const budget = await this.budgetRepository.findById(budgetId);
        if (!budget) {
            throw new NotFoundException(`Budget with ID ${budgetId} not found`);
        }

        const { startDate, endDate } = budget.getPeriodDateRange();

        const spentAmount = await this.getTotalSpentInPeriod(
            budget.userId,
            budget.categoryIds,
            startDate,
            endDate,
        );

        const status = budget.calculateStatus(spentAmount);

        return new BudgetStatusDto({
            ...status,
            periodStart: startDate,
            periodEnd: endDate,
        });
    }

    async getTotalSpentInPeriod(
        userId: string,
        categoryIds: string[],
        startDate: Date,
        endDate: Date,
    ): Promise<number> {
        // Fetch all transactions for the user in the date range
        const transactions = await this.transactionRepository.findByUserIdAndDateRange(
            userId,
            startDate,
            endDate
        );

        // Filter for EXPENSES that match ANY of the budget's categories
        const categoryExpenses = transactions
            .filter(t => categoryIds.includes(t.categoryId) && t.type === TransactionType.EXPENSE)
            .reduce((sum, t) => sum + t.amount.toNumber(), 0);

        return categoryExpenses;
    }
}
