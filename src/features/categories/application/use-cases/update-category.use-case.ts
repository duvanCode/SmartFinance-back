import { Inject, Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { BaseUseCase } from '@shared/application/base.use-case';
import {
    ICategoryRepository,
    CATEGORY_REPOSITORY,
} from '../../domain/repositories/category.repository.interface';
import { CategoryResponseDto } from '../dto/category-response.dto';
import { CategoryName } from '../../domain/value-objects/category-name.vo';
import { CategoryColor } from '../../domain/value-objects/category-color.vo';

export interface UpdateCategoryInput {
    id: string;
    userId: string;
    name?: string;
    color?: string;
    icon?: string;
}

@Injectable()
export class UpdateCategoryUseCase
    implements BaseUseCase<UpdateCategoryInput, CategoryResponseDto> {
    constructor(
        @Inject(CATEGORY_REPOSITORY)
        private readonly categoryRepository: ICategoryRepository,
    ) { }

    async execute(input: UpdateCategoryInput): Promise<CategoryResponseDto> {
        // 1. Find category by ID
        const category = await this.categoryRepository.findById(input.id);

        if (!category) {
            throw new NotFoundException(`Category with id "${input.id}" not found`);
        }

        // 2. Validate ownership
        if (category.userId !== input.userId) {
            throw new ForbiddenException('You do not have permission to update this category');
        }

        // 3. Update category (will throw error if it's a default category)
        try {
            const updatedName = input.name
                ? new CategoryName(input.name)
                : category.name;
            const updatedColor = input.color
                ? new CategoryColor(input.color)
                : category.color;
            const updatedIcon = input.icon ?? category.icon;

            category.update(updatedName, updatedColor, updatedIcon);

            // 4. Persist changes
            const updated = await this.categoryRepository.update(category);

            // 5. Return response
            return new CategoryResponseDto({
                id: updated.id,
                userId: updated.userId,
                name: updated.name.getValue(),
                type: updated.type,
                color: updated.color.getValue(),
                icon: updated.icon,
                isDefault: updated.isDefault,
                createdAt: updated.createdAt,
                updatedAt: updated.updatedAt,
            });
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}
