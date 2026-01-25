import { Inject, Injectable } from '@nestjs/common';
import {
    AI_CATEGORIZER,
    IAICategorizer,
    AICategorizationResult
} from '../../domain/interfaces/ai-categorizer.interface';
import { CATEGORY_REPOSITORY, ICategoryRepository } from '@features/categories/domain/repositories/category.repository.interface';

@Injectable()
export class CreateTransactionFromTextUseCase {
    constructor(
        @Inject(AI_CATEGORIZER) private readonly aiCategorizer: IAICategorizer,
        @Inject(CATEGORY_REPOSITORY) private readonly categoryRepository: ICategoryRepository,
    ) { }

    async execute(userId: string, text: string): Promise<AICategorizationResult[]> {
        // 1. Get user categories to guide the AI
        const categories = await this.categoryRepository.findByUserId(userId);

        // 2. Extract transactions using AI (Claude)
        const extracted = await this.aiCategorizer.extractTransactions(text, categories);

        return extracted;
    }
}
