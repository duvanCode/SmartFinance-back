import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BaseUseCase } from '@shared/application/base.use-case';
import {
    IBudgetRepository,
    BUDGET_REPOSITORY,
} from '../../domain/repositories/budget.repository.interface';
import { BudgetResponseDto } from '../dto/budget-response.dto';

export interface GetBudgetByIdInput {
    id: string;
    userId: string;
}

@Injectable()
export class GetBudgetByIdUseCase
    implements BaseUseCase<GetBudgetByIdInput, BudgetResponseDto> {
    constructor(
        @Inject(BUDGET_REPOSITORY)
        private readonly budgetRepository: IBudgetRepository,
    ) { }

    async execute(input: GetBudgetByIdInput): Promise<BudgetResponseDto> {
        const budget = await this.budgetRepository.findById(input.id);

        if (!budget) {
            throw new NotFoundException(`Budget with ID ${input.id} not found`);
        }

        if (budget.userId !== input.userId) {
            throw new NotFoundException(`Budget with ID ${input.id} not found`);
        }

        return new BudgetResponseDto({
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
        });
    }
}
