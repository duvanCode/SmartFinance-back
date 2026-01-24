import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTransactionUseCase } from './create-transaction.use-case';
import { TRANSACTION_REPOSITORY } from '../../domain/repositories/transaction.repository.interface';
import { CATEGORY_REPOSITORY } from '@features/categories/domain/repositories/category.repository.interface';
import { TransactionType } from '../../domain/enums/transaction-type.enum';
import { CategoryType } from '@features/categories/domain/enums/category-type.enum';

describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase;
  let mockTransactionRepository: any;
  let mockCategoryRepository: any;

  const mockCategory = {
    id: 'category-123',
    userId: 'user-123',
    type: CategoryType.EXPENSE,
    name: { getValue: () => 'Food' },
    color: { getValue: () => '#FF5733' },
    icon: 'food',
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockTransactionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
    };

    mockCategoryRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionUseCase,
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: mockTransactionRepository,
        },
        {
          provide: CATEGORY_REPOSITORY,
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateTransactionUseCase>(CreateTransactionUseCase);
  });

  it('should create transaction successfully', async () => {
    mockCategoryRepository.findById.mockResolvedValue(mockCategory);
    mockTransactionRepository.create.mockImplementation((transaction: any) => ({
      ...transaction,
      amount: { toNumber: () => 100 },
      date: { getValue: () => new Date('2024-01-15') },
    }));

    const result = await useCase.execute({
      userId: 'user-123',
      categoryId: 'category-123',
      amount: 100,
      type: TransactionType.EXPENSE,
      description: 'Lunch',
      date: '2024-01-15',
    });

    expect(result).toBeDefined();
    expect(result.amount).toBe(100);
    expect(mockCategoryRepository.findById).toHaveBeenCalledWith('category-123');
    expect(mockTransactionRepository.create).toHaveBeenCalled();
  });

  it('should throw NotFoundException if category does not exist', async () => {
    mockCategoryRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'user-123',
        categoryId: 'non-existent',
        amount: 100,
        type: TransactionType.EXPENSE,
        description: 'Lunch',
        date: '2024-01-15',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if category does not belong to user', async () => {
    mockCategoryRepository.findById.mockResolvedValue({
      ...mockCategory,
      userId: 'different-user',
    });

    await expect(
      useCase.execute({
        userId: 'user-123',
        categoryId: 'category-123',
        amount: 100,
        type: TransactionType.EXPENSE,
        description: 'Lunch',
        date: '2024-01-15',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if type does not match category type', async () => {
    mockCategoryRepository.findById.mockResolvedValue(mockCategory); // EXPENSE category

    await expect(
      useCase.execute({
        userId: 'user-123',
        categoryId: 'category-123',
        amount: 100,
        type: TransactionType.INCOME, // Trying to create INCOME with EXPENSE category
        description: 'Salary',
        date: '2024-01-15',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw error for invalid amount', async () => {
    mockCategoryRepository.findById.mockResolvedValue(mockCategory);

    await expect(
      useCase.execute({
        userId: 'user-123',
        categoryId: 'category-123',
        amount: -100,
        type: TransactionType.EXPENSE,
        description: 'Lunch',
        date: '2024-01-15',
      }),
    ).rejects.toThrow();
  });
});
