import { Inject, Injectable } from '@nestjs/common';
import { BaseUseCase } from '@shared/application/base.use-case';
import {
    IBudgetRepository,
    BUDGET_REPOSITORY,
} from '../../domain/repositories/budget.repository.interface';
import { BudgetResponseDto } from '../dto/budget-response.dto';

export interface GetBudgetsInput {
    userId: string;
    activeOnly?: boolean;
}

@Injectable()
export class GetBudgetsUseCase
    implements BaseUseCase<GetBudgetsInput, BudgetResponseDto[]> {
    constructor(
        @Inject(BUDGET_REPOSITORY)
        private readonly budgetRepository: IBudgetRepository,
    ) { }

    async execute(input: GetBudgetsInput): Promise<BudgetResponseDto[]> {
        const budgets = input.activeOnly
            ? await this.budgetRepository.findActiveByUserId(input.userId)
            : await this.budgetRepository.findByUserId(input.userId);

        return budgets.map(
            (budget) =>
                new BudgetResponseDto({
                    id: budget.id,
                    userId: budget.userId,
                    name: budget.name,
                    color: budget.color,
                    categoryIds: budget.categoryIds,
                    amount: budget.amount.toNumber(),
                    period: budget.period,
                    startDate: budget.startDate,
                    endDate: budget.endDate,
                    isActive: budget.isActive,
                    createdAt: budget.createdAt,
                    updatedAt: budget.updatedAt,
                }),
        );
    }
}
