import { TransactionDate } from './transaction-date.vo';

describe('TransactionDate Value Object', () => {
  describe('Creation', () => {
    it('should create with valid date', () => {
      const date = new Date('2024-01-15');
      const transactionDate = new TransactionDate(date);
      expect(transactionDate.getValue()).toEqual(date);
    });

    it('should create with date string', () => {
      const transactionDate = new TransactionDate('2024-01-15T12:00:00');
      expect(transactionDate.getValue().getFullYear()).toBe(2024);
      expect(transactionDate.getValue().getMonth()).toBe(0); // January
      expect(transactionDate.getValue().getDate()).toBe(15);
    });

    it('should create with today date', () => {
      const today = new Date();
      const transactionDate = new TransactionDate(today);
      expect(transactionDate.getValue().toDateString()).toBe(today.toDateString());
    });

    it('should reject future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      expect(() => new TransactionDate(futureDate)).toThrow(
        'Transaction date cannot be in the future',
      );
    });

    it('should reject dates more than 10 years old', () => {
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 11);

      expect(() => new TransactionDate(oldDate)).toThrow(
        'Transaction date cannot be more than 10 years in the past',
      );
    });

    it('should reject invalid date format', () => {
      expect(() => new TransactionDate('invalid-date')).toThrow(
        'Invalid date format',
      );
    });
  });

  describe('Comparisons', () => {
    it('should compare equality correctly', () => {
      const date1 = new TransactionDate('2024-01-15');
      const date2 = new TransactionDate('2024-01-15');
      const date3 = new TransactionDate('2024-01-20');

      expect(date1.equals(date2)).toBe(true);
      expect(date1.equals(date3)).toBe(false);
    });

    it('should check isBefore correctly', () => {
      const date1 = new TransactionDate('2024-01-10');
      const date2 = new TransactionDate('2024-01-20');

      expect(date1.isBefore(date2)).toBe(true);
      expect(date2.isBefore(date1)).toBe(false);
    });

    it('should check isAfter correctly', () => {
      const date1 = new TransactionDate('2024-01-20');
      const date2 = new TransactionDate('2024-01-10');

      expect(date1.isAfter(date2)).toBe(true);
      expect(date2.isAfter(date1)).toBe(false);
    });
  });

  describe('Formatting', () => {
    it('should format to ISO string', () => {
      const date = new TransactionDate('2024-01-15T12:00:00.000Z');
      expect(date.format()).toContain('2024-01-15');
    });

    it('should return date string without time', () => {
      const date = new TransactionDate('2024-01-15');
      expect(date.toDateString()).toBe('2024-01-15');
    });

    it('should return ISO format with toString', () => {
      const date = new TransactionDate('2024-01-15');
      expect(date.toString()).toContain('2024-01-15');
    });
  });
});
