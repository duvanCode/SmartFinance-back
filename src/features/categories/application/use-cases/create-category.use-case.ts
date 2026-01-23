import { Inject, Injectable } from '@nestjs/common';
import { BaseUseCase } from '@shared/application/base.use-case';
import {
    ICategoryRepository,
    CATEGORY_REPOSITORY,
} from '../../domain/repositories/category.repository.interface';
import { Category } from '../../domain/entities/category.entity';
import { CategoryResponseDto } from '../dto/category-response.dto';
import { CategoryType } from '../../domain/enums/category-type.enum';

export interface CreateCategoryInput {
    userId: string;
    name: string;
    type: CategoryType;
    color: string;
    icon: string;
}

@Injectable()
export class CreateCategoryUseCase
    implements BaseUseCase<CreateCategoryInput, CategoryResponseDto> {
    constructor(
        @Inject(CATEGORY_REPOSITORY)
        private readonly categoryRepository: ICategoryRepository,
    ) { }

    async execute(input: CreateCategoryInput): Promise<CategoryResponseDto> {
        // 1. Validate that category name doesn't already exist for the user
        const existingCategory = await this.categoryRepository.findByUserIdAndName(
            input.userId,
            input.name,
        );

        if (existingCategory) {
            throw new Error(
                `Category with name "${input.name}" already exists for this user`,
            );
        }

        // 2. Create new Category entity
        const category = Category.create(
            input.userId,
            input.name,
            input.type,
            input.color,
            input.icon,
            false,
        );

        // 3. Persist via repository
        const createdCategory = await this.categoryRepository.create(category);

        // 4. Return CategoryResponseDto
        return new CategoryResponseDto({
            id: createdCategory.id,
            userId: createdCategory.userId,
            name: createdCategory.name.getValue(),
            type: createdCategory.type,
            color: createdCategory.color.getValue(),
            icon: createdCategory.icon,
            isDefault: createdCategory.isDefault,
            createdAt: createdCategory.createdAt,
            updatedAt: createdCategory.updatedAt,
        });
    }
}
