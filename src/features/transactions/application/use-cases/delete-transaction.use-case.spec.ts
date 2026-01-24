import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DeleteTransactionUseCase } from './delete-transaction.use-case';
import { TRANSACTION_REPOSITORY } from '../../domain/repositories/transaction.repository.interface';
import { TransactionType } from '../../domain/enums/transaction-type.enum';
import { InputSource } from '../../domain/enums/input-source.enum';

describe('DeleteTransactionUseCase', () => {
  let useCase: DeleteTransactionUseCase;
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
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockTransactionRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteTransactionUseCase,
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteTransactionUseCase>(DeleteTransactionUseCase);
  });

  it('should delete transaction successfully', async () => {
    mockTransactionRepository.findById.mockResolvedValue(mockTransaction);
    mockTransactionRepository.delete.mockResolvedValue(undefined);

    await expect(
      useCase.execute({
        id: 'trans-123',
        userId: 'user-123',
      }),
    ).resolves.toBeUndefined();

    expect(mockTransactionRepository.delete).toHaveBeenCalledWith('trans-123');
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

    expect(mockTransactionRepository.delete).not.toHaveBeenCalled();
  });
});
