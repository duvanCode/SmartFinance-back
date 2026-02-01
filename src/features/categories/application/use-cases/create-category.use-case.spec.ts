import { CreateCategoryUseCase } from './create-category.use-case';
import { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import { Category } from '../../domain/entities/category.entity';
import { CategoryType } from '../../domain/enums/category-type.enum';
import { ConflictException, BadRequestException } from '@nestjs/common';

describe('CreateCategoryUseCase', () => {
    let useCase: CreateCategoryUseCase;
    let categoryRepository: jest.Mocked<ICategoryRepository>;

    beforeEach(() => {
        categoryRepository = {
            findById: jest.fn(),
            findByUserId: jest.fn(),
            findByUserIdAndType: jest.fn(),
            findByUserIdAndName: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            existsByUserIdAndName: jest.fn(),
        };

        useCase = new CreateCategoryUseCase(categoryRepository);
    });

    describe('Successful creation', () => {
        it('should create a new category successfully', async () => {
            const input = {
                userId: 'user-123',
                name: 'Food',
                type: CategoryType.EXPENSE,
                color: '#FF5733',
                icon: '🍔',
            };

            const createdCategory = Category.create(
                input.userId,
                input.name,
                input.type,
                input.color,
                input.icon,
                false,
            );

            categoryRepository.findByUserIdAndName.mockResolvedValue(null);
            categoryRepository.create.mockResolvedValue(createdCategory);

            const result = await useCase.execute(input);

            expect(categoryRepository.findByUserIdAndName).toHaveBeenCalledWith(
                'user-123',
                'Food',
            );
            expect(categoryRepository.create).toHaveBeenCalled();
            expect(result.name).toBe('Food');
            expect(result.type).toBe(CategoryType.EXPENSE);
            expect(result.color).toBe('#FF5733');
            expect(result.icon).toBe('🍔');
            expect(result.isDefault).toBe(false);
        });
    });

    describe('Duplicate name validation', () => {
        it('should throw ConflictException when category name already exists for user', async () => {
            const input = {
                userId: 'user-123',
                name: 'Food',
                type: CategoryType.EXPENSE,
                color: '#FF5733',
                icon: '🍔',
            };

            const existingCategory = Category.create(
                input.userId,
                input.name,
                input.type,
                input.color,
                input.icon,
                false,
            );

            categoryRepository.findByUserIdAndName.mockResolvedValue(
                existingCategory,
            );

            await expect(useCase.execute(input)).rejects.toThrow(ConflictException);
            await expect(useCase.execute(input)).rejects.toThrow(
                'Category with name "Food" already exists for this user',
            );

            expect(categoryRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('Error handling', () => {
        it('should throw BadRequestException when repository create fails', async () => {
            const input = {
                userId: 'user-123',
                name: 'Food',
                type: CategoryType.EXPENSE,
                color: '#FF5733',
                icon: '🍔',
            };

            categoryRepository.findByUserIdAndName.mockResolvedValue(null);
            categoryRepository.create.mockRejectedValue(new Error('Database error'));

            await expect(useCase.execute(input)).rejects.toThrow(BadRequestException);
            await expect(useCase.execute(input)).rejects.toThrow('Database error');
        });

        it('should throw BadRequestException when validation fails', async () => {
            const input = {
                userId: 'user-123',
                name: 'Food',
                type: CategoryType.EXPENSE,
                color: '#FF5733',
                icon: 'a'.repeat(51), // Too long
            };

            categoryRepository.findByUserIdAndName.mockResolvedValue(null);

            // Validation happens in Category.create inside the use case
            await expect(useCase.execute(input)).rejects.toThrow(BadRequestException);
            await expect(useCase.execute(input)).rejects.toThrow('Icon is too long');
        });
    });
});
