import { CategoryName } from './category-name.vo';

describe('CategoryName Value Object', () => {
  describe('Valid names', () => {
    it('should create category name with valid value', () => {
      const name = new CategoryName('Alimentacion');
      expect(name.getValue()).toBe('Alimentacion');
    });

    it('should trim spaces', () => {
      const name = new CategoryName('  Transporte  ');
      expect(name.getValue()).toBe('Transporte');
    });

    it('should accept minimum length name', () => {
      const name = new CategoryName('AI');
      expect(name.getValue()).toBe('AI');
    });
  });

  describe('Invalid names', () => {
    it('should throw error for empty name', () => {
      expect(() => new CategoryName('')).toThrow('Category name cannot be empty');
    });

    it('should throw error for too short name', () => {
      expect(() => new CategoryName('A')).toThrow(
        'Category name must be at least 2 characters',
      );
    });

    it('should throw error for too long name', () => {
      const longName = 'a'.repeat(51);
      expect(() => new CategoryName(longName)).toThrow(
        'Category name is too long',
      );
    });
  });

  describe('Equality', () => {
    it('should be equal for same name (case insensitive)', () => {
      const name1 = new CategoryName('Alimentacion');
      const name2 = new CategoryName('alimentacion');
      expect(name1.equals(name2)).toBe(true);
    });

    it('should not be equal for different names', () => {
      const name1 = new CategoryName('Alimentacion');
      const name2 = new CategoryName('Transporte');
      expect(name1.equals(name2)).toBe(false);
    });
  });
});
