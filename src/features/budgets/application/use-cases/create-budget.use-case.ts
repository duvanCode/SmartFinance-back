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
    name: string;
    color: string;
    categoryIds: string[];
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
        // 1. Validate all categories exist and belong to user and are EXPENSE type
        for (const catId of input.categoryIds) {
            const category = await this.categoryRepository.findById(catId);

            if (!category) {
                throw new NotFoundException(`Category with ID ${catId} not found`);
            }

            if (category.userId !== input.userId) {
                throw new NotFoundException(`Category with ID ${catId} not found`);
            }

            if (category.type !== CategoryType.EXPENSE) {
                throw new BadRequestException(`Category "${category.name}" is not an EXPENSE category. Budgets can only be created for expenses.`);
            }
        }

        // 2. Validate no active budget exists for ANY of the selected categories in the same period
        // Use the new repository method to check for overlaps
        const exists = await this.budgetRepository.existsActiveForCategories(
            input.userId,
            input.categoryIds,
            input.period,
        );

        if (exists) {
            throw new BadRequestException(
                `One or more selected categories already have an active budget for the ${input.period} period.`,
            );
        }

        // 3. Create new Budget entity
        const budget = Budget.create(
            input.userId,
            input.name,
            input.color,
            input.categoryIds,
            input.amount,
            input.period,
            input.startDate,
            input.endDate,
        );

        // 4. Persist via repository
        const createdBudget = await this.budgetRepository.create(budget);

        // 5. Return BudgetResponseDto
        return new BudgetResponseDto({
            id: createdBudget.id,
            userId: createdBudget.userId,
            name: createdBudget.name,
            color: createdBudget.color,
            categoryIds: createdBudget.categoryIds,
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
