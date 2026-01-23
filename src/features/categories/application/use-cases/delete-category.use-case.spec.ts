import { DeleteCategoryUseCase } from './delete-category.use-case';
import { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import { Category } from '../../domain/entities/category.entity';
import { CategoryType } from '../../domain/enums/category-type.enum';

describe('DeleteCategoryUseCase', () => {
    let useCase: DeleteCategoryUseCase;
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

        useCase = new DeleteCategoryUseCase(categoryRepository);
    });

    describe('Successful deletion', () => {
        it('should delete category successfully', async () => {
            const category = Category.create(
                'user-123',
                'Food',
                CategoryType.EXPENSE,
                '#FF5733',
                '🍔',
                false,
            );

            categoryRepository.findById.mockResolvedValue(category);
            categoryRepository.delete.mockResolvedValue(undefined);

            await useCase.execute({
                id: category.id,
                userId: 'user-123',
            });

            expect(categoryRepository.findById).toHaveBeenCalledWith(category.id);
            expect(categoryRepository.delete).toHaveBeenCalledWith(category.id);
        });
    });

    describe('Default category protection', () => {
        it('should throw error when trying to delete default category', async () => {
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
                }),
            ).rejects.toThrow('Cannot delete default categories');

            expect(categoryRepository.delete).not.toHaveBeenCalled();
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
                }),
            ).rejects.toThrow('You do not have permission to delete this category');

            expect(categoryRepository.delete).not.toHaveBeenCalled();
        });
    });

    describe('Error handling', () => {
        it('should throw error when category is not found', async () => {
            categoryRepository.findById.mockResolvedValue(null);

            await expect(
                useCase.execute({
                    id: 'non-existent-id',
                    userId: 'user-123',
                }),
            ).rejects.toThrow('Category with id "non-existent-id" not found');

            expect(categoryRepository.delete).not.toHaveBeenCalled();
        });
    });
});
