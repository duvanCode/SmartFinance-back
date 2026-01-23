import { Inject, Injectable } from '@nestjs/common';
import { BaseUseCase } from '@shared/application/base.use-case';
import {
    ICategoryRepository,
    CATEGORY_REPOSITORY,
} from '../../domain/repositories/category.repository.interface';
import { CategoryResponseDto } from '../dto/category-response.dto';
import { CategoryType } from '../../domain/enums/category-type.enum';

export interface GetCategoriesInput {
    userId: string;
    type?: CategoryType;
}

@Injectable()
export class GetCategoriesByUserIdUseCase
    implements BaseUseCase<GetCategoriesInput, CategoryResponseDto[]> {
    constructor(
        @Inject(CATEGORY_REPOSITORY)
        private readonly categoryRepository: ICategoryRepository,
    ) { }

    async execute(input: GetCategoriesInput): Promise<CategoryResponseDto[]> {
        // Fetch categories based on optional type filter
        const categories = input.type
            ? await this.categoryRepository.findByUserIdAndType(
                input.userId,
                input.type,
            )
            : await this.categoryRepository.findByUserId(input.userId);

        // Map to DTOs
        return categories.map(
            (category) =>
                new CategoryResponseDto({
                    id: category.id,
                    userId: category.userId,
                    name: category.name.getValue(),
                    type: category.type,
                    color: category.color.getValue(),
                    icon: category.icon,
                    isDefault: category.isDefault,
                    createdAt: category.createdAt,
                    updatedAt: category.updatedAt,
                }),
        );
    }
}
