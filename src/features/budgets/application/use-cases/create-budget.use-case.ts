import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { BaseUseCase } from '@shared/application/base.use-case';
import {
    IBudgetRepository,
    BUDGET_REPOSITORY,
} from '../../domain/repositories/budget.repository.interface';
import {
    ICategoryRepository,
    CATEGORY_REPOSITORY,
} from '../../../categories/domain/repositories/category.repository.interface';
import { Budget } from '../../domain/entities/budget.entity';
import { BudgetPeriod } from '../../domain/enums/budget-period.enum';
import { BudgetResponseDto } from '../dto/budget-response.dto';
import { CategoryType } from '../../../categories/domain/enums/category-type.enum';

export interface CreateBudgetInput {
    userId: string;
    categoryId: string;
    amount: number;
    period: BudgetPeriod;
    startDate?: Date;
    endDate?: Date;
}

@Injectable()
export class CreateBudgetUseCase
    implements BaseUseCase<CreateBudgetInput, BudgetResponseDto> {
    constructor(
        @Inject(BUDGET_REPOSITORY)
        private readonly budgetRepository: IBudgetRepository,
        @Inject(CATEGORY_REPOSITORY)
        private readonly categoryRepository: ICategoryRepository,
    ) { }

    async execute(input: CreateBudgetInput): Promise<BudgetResponseDto> {
        // 1. Validate category exists and belongs to user
        const category = await this.categoryRepository.findById(input.categoryId);

        if (!category) {
            throw new NotFoundException(`Category with ID ${input.categoryId} not found`);
        }

        if (category.userId !== input.userId) {
            throw new NotFoundException(`Category with ID ${input.categoryId} not found`);
        }

        // 2. Validate category type is EXPENSE
        if (category.type !== CategoryType.EXPENSE) {
            throw new BadRequestException('Budgets can only be created for EXPENSE categories');
        }

        // 3. Validate no active budget exists for same category and period
        const exists = await this.budgetRepository.existsActiveForCategory(
            input.userId,
            input.categoryId,
            input.period,
        );

        if (exists) {
            throw new BadRequestException(
                `An active budget already exists for this category with ${input.period} period`,
            );
        }

        // 4. Create new Budget entity
        const budget = Budget.create(
            input.userId,
            input.categoryId,
            input.amount,
            input.period,
            input.startDate,
            input.endDate,
        );

        // 5. Persist via repository
        const createdBudget = await this.budgetRepository.create(budget);

        // 6. Return BudgetResponseDto
        return new BudgetResponseDto({
            id: createdBudget.id,
            userId: createdBudget.userId,
            categoryId: createdBudget.categoryId,
            amount: createdBudget.amount.toNumber(),
            period: createdBudget.period,
            startDate: createdBudget.startDate,
            endDate: createdBudget.endDate,
            isActive: createdBudget.isActive,
            createdAt: createdBudget.createdAt,
            updatedAt: createdBudget.updatedAt,
        });
    }
}
