import { Inject, Injectable, Logger } from '@nestjs/common';
import { BaseUseCase } from '@shared/application/base.use-case';
import {
    IAICategorizer,
    AI_CATEGORIZER,
    AICategorizationResult,
} from '../../domain/interfaces/ai-categorizer.interface';
import {
    ICategoryRepository,
    CATEGORY_REPOSITORY,
} from '../../../categories/domain/repositories/category.repository.interface';
import { CategoryType } from '../../../categories/domain/enums/category-type.enum';

export interface CategorizeTransactionInput {
    userId: string;
    description: string;
    amount: number;
}

@Injectable()
export class CategorizeTransactionUseCase
    implements BaseUseCase<CategorizeTransactionInput, AICategorizationResult> {
    private readonly logger = new Logger(CategorizeTransactionUseCase.name);

    constructor(
        @Inject(AI_CATEGORIZER)
        private readonly aiCategorizer: IAICategorizer,
        @Inject(CATEGORY_REPOSITORY)
        private readonly categoryRepository: ICategoryRepository,
    ) { }

    async execute(
        input: CategorizeTransactionInput,
    ): Promise<AICategorizationResult> {
        // 1. Get user categories to provide context
        // We assume expense categories for categorization, 
        // but we could fetch both if we want to detect Income automatically
        const categories = await this.categoryRepository.findByUserIdAndType(
            input.userId,
            CategoryType.EXPENSE
        );

        if (!categories.length) {
            this.logger.warn(`User ${input.userId} has no EXPENSE categories for AI context`);
            throw new Error('No categories available to classify this transaction');
        }

        // 2. Delegate to AI Provider (Agnostic)
        const result = await this.aiCategorizer.categorize(
            input.description,
            input.amount,
            categories,
        );

        // 3. (Optional) We could apply business logic here, e.g. 
        // if confidence < 0.5, return a specific "Uncategorized" ID or flag it.

        return result;
    }
}
