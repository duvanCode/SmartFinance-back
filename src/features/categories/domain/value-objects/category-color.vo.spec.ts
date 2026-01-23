import { CategoryColor } from './category-color.vo';

describe('CategoryColor Value Object', () => {
  describe('Valid colors', () => {
    it('should create color with 6-digit hex', () => {
      const color = new CategoryColor('#FF5733');
      expect(color.getValue()).toBe('#FF5733');
    });

    it('should create color with 3-digit hex', () => {
      const color = new CategoryColor('#F57');
      expect(color.getValue()).toBe('#F57');
    });

    it('should convert to uppercase', () => {
      const color = new CategoryColor('#ff5733');
      expect(color.getValue()).toBe('#FF5733');
    });
  });

  describe('Invalid colors', () => {
    it('should throw error for empty color', () => {
      expect(() => new CategoryColor('')).toThrow('Color cannot be empty');
    });

    it('should throw error for invalid format', () => {
      expect(() => new CategoryColor('red')).toThrow('Invalid color format');
    });

    it('should throw error for invalid hex', () => {
      expect(() => new CategoryColor('#GGGGGG')).toThrow('Invalid color format');
    });

    it('should throw error for missing #', () => {
      expect(() => new CategoryColor('FF5733')).toThrow('Invalid color format');
    });
  });

  describe('Equality', () => {
    it('should be equal for same color', () => {
      const color1 = new CategoryColor('#FF5733');
      const color2 = new CategoryColor('#ff5733');
      expect(color1.equals(color2)).toBe(true);
    });

    it('should not be equal for different colors', () => {
      const color1 = new CategoryColor('#FF5733');
      const color2 = new CategoryColor('#33FF57');
      expect(color1.equals(color2)).toBe(false);
    });
  });
});
