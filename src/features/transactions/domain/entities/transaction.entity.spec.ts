import { Transaction } from './transaction.entity';
import { TransactionType } from '../enums/transaction-type.enum';
import { InputSource } from '../enums/input-source.enum';
import { Money } from '../value-objects/money.vo';
import { TransactionDate } from '../value-objects/transaction-date.vo';

describe('Transaction Entity', () => {
  const validUserId = 'user-123';
  const validCategoryId = 'category-123';
  const validAmount = 100;
  const validDescription = 'Test transaction';
  const validDate = new Date('2024-01-15');

  describe('Creation', () => {
    it('should create income transaction successfully', () => {
      const transaction = Transaction.create(
        validUserId,
        validCategoryId,
        validAmount,
        TransactionType.INCOME,
        validDescription,
        validDate,
      );

      expect(transaction.userId).toBe(validUserId);
      expect(transaction.categoryId).toBe(validCategoryId);
      expect(transaction.amount.toNumber()).toBe(validAmount);
      expect(transaction.type).toBe(TransactionType.INCOME);
      expect(transaction.description).toBe(validDescription);
      expect(transaction.source).toBe(InputSource.MANUAL);
    });

    it('should create expense transaction successfully', () => {
      const transaction = Transaction.create(
        validUserId,
        validCategoryId,
        validAmount,
        TransactionType.EXPENSE,
        validDescription,
        validDate,
      );

      expect(transaction.type).toBe(TransactionType.EXPENSE);
    });

    it('should default source to MANUAL', () => {
      const transaction = Transaction.create(
        validUserId,
        validCategoryId,
        validAmount,
        TransactionType.EXPENSE,
        validDescription,
        validDate,
      );

      expect(transaction.source).toBe(InputSource.MANUAL);
    });

    it('should reject empty userId', () => {
      expect(() =>
        Transaction.create(
          '',
          validCategoryId,
          validAmount,
          TransactionType.EXPENSE,
          validDescription,
          validDate,
        ),
      ).toThrow('User ID cannot be empty');
    });

    it('should reject empty categoryId', () => {
      expect(() =>
        Transaction.create(
          validUserId,
          '',
          validAmount,
          TransactionType.EXPENSE,
          validDescription,
          validDate,
        ),
      ).toThrow('Category ID cannot be empty');
    });

    it('should reject empty description', () => {
      expect(() =>
        Transaction.create(
          validUserId,
          validCategoryId,
          validAmount,
          TransactionType.EXPENSE,
          '',
          validDate,
        ),
      ).toThrow('Description cannot be empty');
    });

    it('should reject description too long (>200 chars)', () => {
      const longDescription = 'a'.repeat(201);
      expect(() =>
        Transaction.create(
          validUserId,
          validCategoryId,
          validAmount,
          TransactionType.EXPENSE,
          longDescription,
          validDate,
        ),
      ).toThrow('Description is too long (max 200 characters)');
    });

    it('should reject invalid amount (negative)', () => {
      expect(() =>
        Transaction.create(
          validUserId,
          validCategoryId,
          -100,
          TransactionType.EXPENSE,
          validDescription,
          validDate,
        ),
      ).toThrow('Amount must be greater than zero');
    });

    it('should reject invalid amount (zero)', () => {
      expect(() =>
        Transaction.create(
          validUserId,
          validCategoryId,
          0,
          TransactionType.EXPENSE,
          validDescription,
          validDate,
        ),
      ).toThrow('Amount must be greater than zero');
    });
  });

  describe('Update', () => {
    it('should update transaction successfully', () => {
      const transaction = Transaction.create(
        validUserId,
        validCategoryId,
        validAmount,
        TransactionType.EXPENSE,
        validDescription,
        validDate,
      );

      const originalUpdatedAt = transaction.updatedAt;

      // Wait a bit to ensure updatedAt changes
      const newDescription = 'Updated description';
      const newAmount = new Money(200);
      const newCategoryId = 'new-category-123';
      const newDate = new TransactionDate('2024-01-20');

      transaction.update(newDescription, newAmount, newCategoryId, newDate);

      expect(transaction.description).toBe(newDescription);
      expect(transaction.amount.toNumber()).toBe(200);
      expect(transaction.categoryId).toBe(newCategoryId);
      expect(transaction.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('should reject empty categoryId in update', () => {
      const transaction = Transaction.create(
        validUserId,
        validCategoryId,
        validAmount,
        TransactionType.EXPENSE,
        validDescription,
        validDate,
      );

      expect(() =>
        transaction.update(
          validDescription,
          new Money(100),
          '',
          new TransactionDate(validDate),
        ),
      ).toThrow('Category ID cannot be empty');
    });

    it('should reject invalid description in update', () => {
      const transaction = Transaction.create(
        validUserId,
        validCategoryId,
        validAmount,
        TransactionType.EXPENSE,
        validDescription,
        validDate,
      );

      expect(() =>
        transaction.update(
          '',
          new Money(100),
          validCategoryId,
          new TransactionDate(validDate),
        ),
      ).toThrow('Description cannot be empty');
    });
  });

  describe('Business methods', () => {
    it('isIncome() should return true for INCOME type', () => {
      const transaction = Transaction.create(
        validUserId,
        validCategoryId,
        validAmount,
        TransactionType.INCOME,
        validDescription,
        validDate,
      );

      expect(transaction.isIncome()).toBe(true);
      expect(transaction.isExpense()).toBe(false);
    });

    it('isExpense() should return true for EXPENSE type', () => {
      const transaction = Transaction.create(
        validUserId,
        validCategoryId,
        validAmount,
        TransactionType.EXPENSE,
        validDescription,
        validDate,
      );

      expect(transaction.isExpense()).toBe(true);
      expect(transaction.isIncome()).toBe(false);
    });

    it('isFromAI() should return false for MANUAL source', () => {
      const transaction = Transaction.create(
        validUserId,
        validCategoryId,
        validAmount,
        TransactionType.EXPENSE,
        validDescription,
        validDate,
        InputSource.MANUAL,
      );

      expect(transaction.isFromAI()).toBe(false);
    });

    it('isFromAI() should return true for AI_TEXT source', () => {
      const transaction = Transaction.create(
        validUserId,
        validCategoryId,
        validAmount,
        TransactionType.EXPENSE,
        validDescription,
        validDate,
        InputSource.AI_TEXT,
      );

      expect(transaction.isFromAI()).toBe(true);
    });

    it('isFromAI() should return true for AI_AUDIO source', () => {
      const transaction = Transaction.create(
        validUserId,
        validCategoryId,
        validAmount,
        TransactionType.EXPENSE,
        validDescription,
        validDate,
        InputSource.AI_AUDIO,
      );

      expect(transaction.isFromAI()).toBe(true);
    });
  });

  describe('Persistence', () => {
    it('should convert to persistence format correctly', () => {
      const transaction = Transaction.create(
        validUserId,
        validCategoryId,
        validAmount,
        TransactionType.EXPENSE,
        validDescription,
        validDate,
      );

      const persisted = transaction.toPersistence();

      expect(persisted.userId).toBe(validUserId);
      expect(persisted.categoryId).toBe(validCategoryId);
      expect(persisted.type).toBe(TransactionType.EXPENSE);
      expect(persisted.description).toBe(validDescription);
      expect(persisted.source).toBe(InputSource.MANUAL);
    });

    it('should reconstruct from persistence correctly', () => {
      const { Decimal } = require('@prisma/client/runtime/library');
      const data = {
        id: 'trans-123',
        userId: validUserId,
        categoryId: validCategoryId,
        amount: new Decimal(100),
        type: TransactionType.EXPENSE,
        description: validDescription,
        date: validDate,
        source: InputSource.MANUAL,
        rawInput: null,
        aiConfidence: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const transaction = Transaction.fromPersistence(data);

      expect(transaction.id).toBe('trans-123');
      expect(transaction.userId).toBe(validUserId);
      expect(transaction.type).toBe(TransactionType.EXPENSE);
    });
  });
});
