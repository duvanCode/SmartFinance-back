import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BaseUseCase } from '@shared/application/base.use-case';
import {
    IBudgetRepository,
    BUDGET_REPOSITORY,
} from '../../domain/repositories/budget.repository.interface';
import { BudgetResponseDto } from '../dto/budget-response.dto';
import { BudgetPeriod } from '../../domain/enums/budget-period.enum';
import { BudgetAmount } from '../../domain/value-objects/budget-amount.vo';

export interface UpdateBudgetInput {
    id: string;
    userId: string;
    name?: string;
    color?: string;
    categoryIds?: string[];
    amount?: number;
    period?: BudgetPeriod;
}

@Injectable()
export class UpdateBudgetUseCase
    implements BaseUseCase<UpdateBudgetInput, BudgetResponseDto> {
    constructor(
        @Inject(BUDGET_REPOSITORY)
        private readonly budgetRepository: IBudgetRepository,
    ) { }

    async execute(input: UpdateBudgetInput): Promise<BudgetResponseDto> {
        const budget = await this.budgetRepository.findById(input.id);

        if (!budget) {
            throw new NotFoundException(`Budget with ID ${input.id} not found`);
        }

        if (budget.userId !== input.userId) {
            throw new NotFoundException(`Budget with ID ${input.id} not found`);
        }

        // Check if updating period would cause conflict
        // Check if updating period or categories would cause conflict
        const targetPeriod = input.period || budget.period;
        const targetCategoryIds = input.categoryIds || budget.categoryIds;

        if (
            (input.period || input.categoryIds) &&
            budget.isActive
        ) {
            const exists = await this.budgetRepository.existsActiveForCategories(
                input.userId,
                targetCategoryIds,
                targetPeriod,
                budget.id, // Exclude current budget from check
            );

            if (exists) {
                throw new BadRequestException(
                    `An active budget already exists for one of these categories with ${targetPeriod} period`,
                );
            }
        }

        const newAmount = input.amount ? new BudgetAmount(input.amount) : budget.amount;

        budget.update(
            input.name || budget.name,
            input.color || budget.color,
            newAmount,
            input.categoryIds || budget.categoryIds,
            input.period
        );

        const updatedBudget = await this.budgetRepository.update(budget);

        return new BudgetResponseDto({
            id: updatedBudget.id,
            userId: updatedBudget.userId,
            name: updatedBudget.name,
            color: updatedBudget.color,
            categoryIds: updatedBudget.categoryIds,
            amount: updatedBudget.amount.toNumber(),
            period: updatedBudget.period,
            startDate: updatedBudget.startDate,
            endDate: updatedBudget.endDate,
            isActive: updatedBudget.isActive,
            createdAt: updatedBudget.createdAt,
            updatedAt: updatedBudget.updatedAt,
        });
    }
}
