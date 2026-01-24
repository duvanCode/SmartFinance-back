import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BaseUseCase } from '@shared/application/base.use-case';
import {
    IBudgetRepository,
    BUDGET_REPOSITORY,
} from '../../domain/repositories/budget.repository.interface';
import { BudgetStatusDto } from '../dto/budget-status.dto';
import { BudgetAnalyzerService } from '../../infrastructure/services/budget-analyzer.service';

export interface GetBudgetStatusInput {
    id: string;
    userId: string;
}

@Injectable()
export class GetBudgetStatusUseCase
    implements BaseUseCase<GetBudgetStatusInput, BudgetStatusDto> {
    constructor(
        @Inject(BUDGET_REPOSITORY)
        private readonly budgetRepository: IBudgetRepository,
        private readonly budgetAnalyzerService: BudgetAnalyzerService,
    ) { }

    async execute(input: GetBudgetStatusInput): Promise<BudgetStatusDto> {
        const budget = await this.budgetRepository.findById(input.id);

        if (!budget) {
            throw new NotFoundException(`Budget with ID ${input.id} not found`);
        }

        if (budget.userId !== input.userId) {
            throw new NotFoundException(`Budget with ID ${input.id} not found`);
        }

        return this.budgetAnalyzerService.calculateBudgetProgress(budget.id);
    }
}
