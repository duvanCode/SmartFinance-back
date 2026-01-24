import { Money } from './money.vo';

describe('Money Value Object', () => {
  describe('Creation', () => {
    it('should create Money with valid positive value', () => {
      const money = new Money(100.5);
      expect(money.toNumber()).toBe(100.5);
    });

    it('should create Money with string value', () => {
      const money = new Money('50.25');
      expect(money.toNumber()).toBe(50.25);
    });

    it('should reject negative values', () => {
      expect(() => new Money(-100)).toThrow('Amount must be greater than zero');
    });

    it('should reject zero', () => {
      expect(() => new Money(0)).toThrow('Amount must be greater than zero');
    });

    it('should reject more than 2 decimal places', () => {
      expect(() => new Money(10.123)).toThrow(
        'Amount cannot have more than 2 decimal places',
      );
    });

    it('should reject amounts exceeding maximum', () => {
      expect(() => new Money(100000000)).toThrow(
        'Amount exceeds maximum allowed value',
      );
    });
  });

  describe('Operations', () => {
    it('should add two Money correctly', () => {
      const money1 = new Money(100);
      const money2 = new Money(50.5);
      const result = money1.add(money2);
      expect(result.toNumber()).toBe(150.5);
    });

    it('should subtract two Money correctly', () => {
      const money1 = new Money(100);
      const money2 = new Money(30);
      const result = money1.subtract(money2);
      expect(result.toNumber()).toBe(70);
    });

    it('should throw when subtraction results in zero or negative', () => {
      const money1 = new Money(50);
      const money2 = new Money(50);
      expect(() => money1.subtract(money2)).toThrow(
        'Resulting amount must be greater than zero',
      );
    });
  });

  describe('Comparison', () => {
    it('should compare equality correctly', () => {
      const money1 = new Money(100);
      const money2 = new Money(100);
      const money3 = new Money(50);

      expect(money1.equals(money2)).toBe(true);
      expect(money1.equals(money3)).toBe(false);
    });

    it('should compare greater than correctly', () => {
      const money1 = new Money(100);
      const money2 = new Money(50);

      expect(money1.isGreaterThan(money2)).toBe(true);
      expect(money2.isGreaterThan(money1)).toBe(false);
    });

    it('should compare less than correctly', () => {
      const money1 = new Money(50);
      const money2 = new Money(100);

      expect(money1.isLessThan(money2)).toBe(true);
      expect(money2.isLessThan(money1)).toBe(false);
    });
  });

  describe('Formatting', () => {
    it('should format with USD symbol by default', () => {
      const money = new Money(100.5);
      expect(money.format()).toBe('$100.50');
    });

    it('should format with EUR symbol', () => {
      const money = new Money(100.5);
      expect(money.format('EUR')).toBe('€100.50');
    });

    it('should format with GBP symbol', () => {
      const money = new Money(100.5);
      expect(money.format('GBP')).toBe('£100.50');
    });

    it('should use currency code if symbol not found', () => {
      const money = new Money(100.5);
      expect(money.format('JPY')).toBe('JPY100.50');
    });

    it('should return string with 2 decimal places', () => {
      const money = new Money(100);
      expect(money.toString()).toBe('100.00');
    });
  });
});
