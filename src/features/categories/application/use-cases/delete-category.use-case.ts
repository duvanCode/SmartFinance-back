import { Inject, Injectable } from '@nestjs/common';
import { BaseUseCase } from '@shared/application/base.use-case';
import {
    ICategoryRepository,
    CATEGORY_REPOSITORY,
} from '../../domain/repositories/category.repository.interface';

export interface DeleteCategoryInput {
    id: string;
    userId: string;
}

@Injectable()
export class DeleteCategoryUseCase
    implements BaseUseCase<DeleteCategoryInput, void> {
    constructor(
        @Inject(CATEGORY_REPOSITORY)
        private readonly categoryRepository: ICategoryRepository,
    ) { }

    async execute(input: DeleteCategoryInput): Promise<void> {
        // 1. Find category by ID
        const category = await this.categoryRepository.findById(input.id);

        if (!category) {
            throw new Error(`Category with id "${input.id}" not found`);
        }

        // 2. Validate ownership
        if (category.userId !== input.userId) {
            throw new Error('You do not have permission to delete this category');
        }

        // 3. Validate that it's not a default category
        if (category.isDefault) {
            throw new Error('Cannot delete default categories');
        }

        // 4. Delete category
        await this.categoryRepository.delete(input.id);
    }
}
