import { GetCategoriesByUserIdUseCase } from './get-categories-by-user-id.use-case';
import { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import { Category } from '../../domain/entities/category.entity';
import { CategoryType } from '../../domain/enums/category-type.enum';

describe('GetCategoriesByUserIdUseCase', () => {
    let useCase: GetCategoriesByUserIdUseCase;
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

        useCase = new GetCategoriesByUserIdUseCase(categoryRepository);
    });

    describe('Fetch all categories', () => {
        it('should return all categories for a user', async () => {
            const category1 = Category.create(
                'user-123',
                'Food',
                CategoryType.EXPENSE,
                '#FF5733',
                '🍔',
            );
            const category2 = Category.create(
                'user-123',
                'Salary',
                CategoryType.INCOME,
                '#33FF57',
                '💼',
            );

            categoryRepository.findByUserId.mockResolvedValue([
                category1,
                category2,
            ]);

            const result = await useCase.execute({ userId: 'user-123' });

            expect(categoryRepository.findByUserId).toHaveBeenCalledWith('user-123');
            expect(categoryRepository.findByUserIdAndType).not.toHaveBeenCalled();
            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('Food');
            expect(result[1].name).toBe('Salary');
        });
    });

    describe('Filter by type', () => {
        it('should return only income categories when type filter is provided', async () => {
            const category = Category.create(
                'user-123',
                'Salary',
                CategoryType.INCOME,
                '#33FF57',
                '💼',
            );

            categoryRepository.findByUserIdAndType.mockResolvedValue([category]);

            const result = await useCase.execute({
                userId: 'user-123',
                type: CategoryType.INCOME,
            });

            expect(categoryRepository.findByUserIdAndType).toHaveBeenCalledWith(
                'user-123',
                CategoryType.INCOME,
            );
            expect(categoryRepository.findByUserId).not.toHaveBeenCalled();
            expect(result).toHaveLength(1);
            expect(result[0].type).toBe(CategoryType.INCOME);
        });

        it('should return only expense categories when type filter is EXPENSE', async () => {
            const category = Category.create(
                'user-123',
                'Food',
                CategoryType.EXPENSE,
                '#FF5733',
                '🍔',
            );

            categoryRepository.findByUserIdAndType.mockResolvedValue([category]);

            const result = await useCase.execute({
                userId: 'user-123',
                type: CategoryType.EXPENSE,
            });

            expect(categoryRepository.findByUserIdAndType).toHaveBeenCalledWith(
                'user-123',
                CategoryType.EXPENSE,
            );
            expect(result).toHaveLength(1);
            expect(result[0].type).toBe(CategoryType.EXPENSE);
        });
    });

    describe('Empty results', () => {
        it('should return empty array when user has no categories', async () => {
            categoryRepository.findByUserId.mockResolvedValue([]);

            const result = await useCase.execute({ userId: 'user-123' });

            expect(result).toHaveLength(0);
        });
    });
});
