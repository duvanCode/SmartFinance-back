import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BaseUseCase } from '@shared/application/base.use-case';
import {
    IBudgetRepository,
    BUDGET_REPOSITORY,
} from '../../domain/repositories/budget.repository.interface';

export interface DeleteBudgetInput {
    id: string;
    userId: string;
}

@Injectable()
export class DeleteBudgetUseCase implements BaseUseCase<DeleteBudgetInput, void> {
    constructor(
        @Inject(BUDGET_REPOSITORY)
        private readonly budgetRepository: IBudgetRepository,
    ) { }

    async execute(input: DeleteBudgetInput): Promise<void> {
        const budget = await this.budgetRepository.findById(input.id);

        if (!budget) {
            throw new NotFoundException(`Budget with ID ${input.id} not found`);
        }

        if (budget.userId !== input.userId) {
            throw new NotFoundException(`Budget with ID ${input.id} not found`);
        }

        await this.budgetRepository.delete(input.id);
    }
}
