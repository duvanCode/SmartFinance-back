import { Email } from './email.vo';

describe('Email Value Object', () => {
  describe('Valid emails', () => {
    it('should create email with valid format', () => {
      const email = new Email('test@example.com');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should trim and lowercase email', () => {
      const email = new Email('  TEST@Example.COM  ');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should accept email with subdomain', () => {
      const email = new Email('user@mail.example.com');
      expect(email.getValue()).toBe('user@mail.example.com');
    });
  });

  describe('Invalid emails', () => {
    it('should throw error for empty email', () => {
      expect(() => new Email('')).toThrow('Email cannot be empty');
    });

    it('should throw error for email without @', () => {
      expect(() => new Email('testexample.com')).toThrow('Invalid email format');
    });

    it('should throw error for email without domain', () => {
      expect(() => new Email('test@')).toThrow('Invalid email format');
    });

    it('should throw error for too long email', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(() => new Email(longEmail)).toThrow('Email is too long');
    });
  });

  describe('Equality', () => {
    it('should be equal for same email', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should not be equal for different emails', () => {
      const email1 = new Email('test1@example.com');
      const email2 = new Email('test2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });
  });
});
