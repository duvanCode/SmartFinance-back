import { UpdateCategoryUseCase } from './update-category.use-case';
import { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import { Category } from '../../domain/entities/category.entity';
import { CategoryType } from '../../domain/enums/category-type.enum';

describe('UpdateCategoryUseCase', () => {
    let useCase: UpdateCategoryUseCase;
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

        useCase = new UpdateCategoryUseCase(categoryRepository);
    });

    describe('Successful update', () => {
        it('should update category successfully', async () => {
            const category = Category.create(
                'user-123',
                'Food',
                CategoryType.EXPENSE,
                '#FF5733',
                '🍔',
                false,
            );

            categoryRepository.findById.mockResolvedValue(category);
            categoryRepository.update.mockResolvedValue(category);

            const result = await useCase.execute({
                id: category.id,
                userId: 'user-123',
                name: 'Groceries',
                color: '#00FF00',
                icon: '🛒',
            });

            expect(categoryRepository.findById).toHaveBeenCalledWith(category.id);
            expect(categoryRepository.update).toHaveBeenCalled();
            expect(result.name).toBe('Groceries');
            expect(result.color).toBe('#00FF00');
            expect(result.icon).toBe('🛒');
        });

        it('should update only provided fields', async () => {
            const category = Category.create(
                'user-123',
                'Food',
                CategoryType.EXPENSE,
                '#FF5733',
                '🍔',
                false,
            );

            categoryRepository.findById.mockResolvedValue(category);
            categoryRepository.update.mockResolvedValue(category);

            const result = await useCase.execute({
                id: category.id,
                userId: 'user-123',
                name: 'Groceries',
            });

            expect(result.name).toBe('Groceries');
            expect(result.color).toBe('#FF5733');
            expect(result.icon).toBe('🍔');
        });
    });

    describe('Default category protection', () => {
        it('should throw error when trying to update default category', async () => {
            const category = Category.create(
                'user-123',
                'Salary',
                CategoryType.INCOME,
                '#33FF57',
                '💼',
                true, // Default category
            );

            categoryRepository.findById.mockResolvedValue(category);

            await expect(
                useCase.execute({
                    id: category.id,
                    userId: 'user-123',
                    name: 'Monthly Salary',
                }),
            ).rejects.toThrow('Cannot modify default categories');

            expect(categoryRepository.update).not.toHaveBeenCalled();
        });
    });

    describe('Ownership validation', () => {
        it('should throw error when user does not own the category', async () => {
            const category = Category.create(
                'user-123',
                'Food',
                CategoryType.EXPENSE,
                '#FF5733',
                '🍔',
                false,
            );

            categoryRepository.findById.mockResolvedValue(category);

            await expect(
                useCase.execute({
                    id: category.id,
                    userId: 'user-456', // Different user
                    name: 'Groceries',
                }),
            ).rejects.toThrow('You do not have permission to update this category');

            expect(categoryRepository.update).not.toHaveBeenCalled();
        });
    });

    describe('Error handling', () => {
        it('should throw error when category is not found', async () => {
            categoryRepository.findById.mockResolvedValue(null);

            await expect(
                useCase.execute({
                    id: 'non-existent-id',
                    userId: 'user-123',
                    name: 'Groceries',
                }),
            ).rejects.toThrow('Category with id "non-existent-id" not found');
        });
    });
});
