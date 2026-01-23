import { Category } from './category.entity';
import { CategoryType } from '../enums/category-type.enum';
import { CategoryName } from '../value-objects/category-name.vo';
import { CategoryColor } from '../value-objects/category-color.vo';

describe('Category Entity', () => {
  describe('Creation', () => {
    it('should create category with valid data', () => {
      const category = Category.create(
        'user-123',
        'Alimentacion',
        CategoryType.EXPENSE,
        '#FF5733',
        'food',
      );

      expect(category.userId).toBe('user-123');
      expect(category.name.getValue()).toBe('Alimentacion');
      expect(category.type).toBe(CategoryType.EXPENSE);
      expect(category.color.getValue()).toBe('#FF5733');
      expect(category.icon).toBe('food');
      expect(category.isDefault).toBe(false);
    });

    it('should create default category', () => {
      const category = Category.create(
        'system',
        'Salario',
        CategoryType.INCOME,
        '#4CAF50',
        'money',
        true,
      );

      expect(category.isDefault).toBe(true);
    });

    it('should throw error for empty icon', () => {
      expect(() =>
        Category.create(
          'user-123',
          'Test',
          CategoryType.EXPENSE,
          '#FF5733',
          '',
        ),
      ).toThrow('Icon cannot be empty');
    });

    it('should throw error for too long icon', () => {
      expect(() =>
        Category.create(
          'user-123',
          'Test',
          CategoryType.EXPENSE,
          '#FF5733',
          'a'.repeat(11),
        ),
      ).toThrow('Icon is too long');
    });
  });

  describe('Update', () => {
    it('should update category successfully', () => {
      const category = Category.create(
        'user-123',
        'Alimentacion',
        CategoryType.EXPENSE,
        '#FF5733',
        'food',
      );

      const newName = new CategoryName('Comida');
      const newColor = new CategoryColor('#E91E63');

      category.update(newName, newColor, 'pizza');

      expect(category.name.getValue()).toBe('Comida');
      expect(category.color.getValue()).toBe('#E91E63');
      expect(category.icon).toBe('pizza');
    });

    it('should throw error when updating default category', () => {
      const category = Category.create(
        'system',
        'Salario',
        CategoryType.INCOME,
        '#4CAF50',
        'money',
        true,
      );

      expect(() =>
        category.update(
          new CategoryName('Nuevo nombre'),
          new CategoryColor('#FF0000'),
          'cash',
        ),
      ).toThrow('Cannot modify default categories');
    });
  });

  describe('Persistence', () => {
    it('should convert to persistence format', () => {
      const category = Category.create(
        'user-123',
        'Transporte',
        CategoryType.EXPENSE,
        '#2196F3',
        'car',
      );

      const persistence = category.toPersistence();

      expect(persistence).toEqual({
        id: category.id,
        userId: 'user-123',
        name: 'Transporte',
        type: CategoryType.EXPENSE,
        color: '#2196F3',
        icon: 'car',
        isDefault: false,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      });
    });

    it('should reconstruct from persistence', () => {
      const persistenceData = {
        id: 'category-123',
        userId: 'user-456',
        name: 'Salud',
        type: CategoryType.EXPENSE,
        color: '#E91E63',
        icon: 'health',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const category = Category.fromPersistence(persistenceData);

      expect(category.id).toBe('category-123');
      expect(category.userId).toBe('user-456');
      expect(category.name.getValue()).toBe('Salud');
      expect(category.type).toBe(CategoryType.EXPENSE);
    });
  });
});
