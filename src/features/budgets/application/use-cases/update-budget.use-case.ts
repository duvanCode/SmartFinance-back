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
        if (input.period && input.period !== budget.period && budget.isActive) {
            const exists = await this.budgetRepository.existsActiveForCategory(
                input.userId,
                budget.categoryId,
                input.period,
                budget.id, // Exclude current budget from check
            );

            if (exists) {
                throw new BadRequestException(
                    `An active budget already exists for this category with ${input.period} period`,
                );
            }
        }

        if (input.amount) {
            const newAmount = new BudgetAmount(input.amount);
            budget.update(newAmount, input.period);
        } else if (input.period) {
            // If only updating period, we still need to pass amount to update method
            budget.update(budget.amount, input.period);
        }

        const updatedBudget = await this.budgetRepository.update(budget);

        return new BudgetResponseDto({
            id: updatedBudget.id,
            userId: updatedBudget.userId,
            categoryId: updatedBudget.categoryId,
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
