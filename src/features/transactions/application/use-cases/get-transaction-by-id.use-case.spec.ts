import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetTransactionByIdUseCase } from './get-transaction-by-id.use-case';
import { TRANSACTION_REPOSITORY } from '../../domain/repositories/transaction.repository.interface';
import { TransactionType } from '../../domain/enums/transaction-type.enum';
import { InputSource } from '../../domain/enums/input-source.enum';

describe('GetTransactionByIdUseCase', () => {
  let useCase: GetTransactionByIdUseCase;
  let mockTransactionRepository: any;

  const mockTransaction = {
    id: 'trans-123',
    userId: 'user-123',
    categoryId: 'category-123',
    amount: { toNumber: () => 100 },
    type: TransactionType.EXPENSE,
    description: 'Test transaction',
    date: { getValue: () => new Date('2024-01-15') },
    source: InputSource.MANUAL,
    rawInput: undefined,
    aiConfidence: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockTransactionRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTransactionByIdUseCase,
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetTransactionByIdUseCase>(GetTransactionByIdUseCase);
  });

  it('should get transaction successfully', async () => {
    mockTransactionRepository.findById.mockResolvedValue(mockTransaction);

    const result = await useCase.execute({
      id: 'trans-123',
      userId: 'user-123',
    });

    expect(result).toBeDefined();
    expect(result.id).toBe('trans-123');
    expect(result.amount).toBe(100);
  });

  it('should throw NotFoundException if transaction does not exist', async () => {
    mockTransactionRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        id: 'non-existent',
        userId: 'user-123',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if transaction does not belong to user', async () => {
    mockTransactionRepository.findById.mockResolvedValue({
      ...mockTransaction,
      userId: 'different-user',
    });

    await expect(
      useCase.execute({
        id: 'trans-123',
        userId: 'user-123',
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});
