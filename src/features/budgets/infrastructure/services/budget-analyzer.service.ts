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
            budget.categoryId,
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
        categoryId: string,
        startDate: Date,
        endDate: Date,
    ): Promise<number> {
        // We only sum EXPENSE transactions
        const total = await this.transactionRepository.getTotalByUserIdAndDateRange(
            userId,
            startDate,
            endDate,
            TransactionType.EXPENSE,
        );

        // TODO: Filter by categoryId in repository query
        // Since existing method might not support categoryId filtering yet, 
        // we assume for now we might need to fetch by category or update repository.
        // Checking ITransactionRepository interface...

        // Based on interface from existing code, we need a method that filters by category AND date range.
        // If not exists, we use findByUserIdAndDateRange and filter manually.
        const transactions = await this.transactionRepository.findByUserIdAndDateRange(
            userId,
            startDate,
            endDate
        );

        const categoryExpenses = transactions
            .filter(t => t.categoryId === categoryId && t.type === TransactionType.EXPENSE)
            .reduce((sum, t) => sum + t.amount.toNumber(), 0);

        return categoryExpenses;
    }
}
