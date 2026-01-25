import { Category } from '@features/categories/domain/entities/category.entity';

export interface AICategorizationResult {
    categoryId: string;
    confidence: number;
    reasoning: string;
    description?: string;
    amount?: number;
}

export interface IAICategorizer {
    categorize(
        description: string,
        amount: number,
        availableCategories: Category[],
    ): Promise<AICategorizationResult>;

    extractTransactions(
        text: string,
        availableCategories: Category[],
    ): Promise<AICategorizationResult[]>;
}

export const AI_CATEGORIZER = Symbol('AI_CATEGORIZER');
