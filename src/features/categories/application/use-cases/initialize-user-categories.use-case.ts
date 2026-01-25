import { Inject, Injectable } from '@nestjs/common';
import { BaseUseCase } from '@shared/application/base.use-case';
import {
    ICategoryRepository,
    CATEGORY_REPOSITORY,
} from '../../domain/repositories/category.repository.interface';
import { Category } from '../../domain/entities/category.entity';
import { DEFAULT_CATEGORIES } from '../../domain/constants/default-categories.constant';

@Injectable()
export class InitializeUserCategoriesUseCase
    implements BaseUseCase<string, void> {
    constructor(
        @Inject(CATEGORY_REPOSITORY)
        private readonly categoryRepository: ICategoryRepository,
    ) { }

    async execute(userId: string): Promise<void> {
        const existing = await this.categoryRepository.findByUserId(userId);

        // Only initialize if the user has no categories
        if (existing.length > 0) return;

        const categories = DEFAULT_CATEGORIES.map((dc) =>
            Category.create(
                userId,
                dc.name,
                dc.type,
                dc.color,
                dc.icon,
                true, // isDefault
            ),
        );

        for (const category of categories) {
            await this.categoryRepository.create(category);
        }
    }
}
