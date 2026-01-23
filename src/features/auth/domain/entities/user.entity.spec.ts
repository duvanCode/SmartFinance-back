import { User } from './user.entity';

describe('User Entity', () => {
  describe('Creation', () => {
    it('should create user with valid data', () => {
      const user = User.create(
        'test@example.com',
        'John Doe',
        '1234567890123456789',
        'https://avatar.url',
      );

      expect(user.email.getValue()).toBe('test@example.com');
      expect(user.name).toBe('John Doe');
      expect(user.googleId.getValue()).toBe('1234567890123456789');
      expect(user.avatar).toBe('https://avatar.url');
      expect(user.id).toBeDefined();
    });

    it('should create user without avatar', () => {
      const user = User.create(
        'test@example.com',
        'John Doe',
        '1234567890123456789',
      );

      expect(user.avatar).toBeUndefined();
    });
  });

  describe('Update profile', () => {
    it('should update name and avatar', () => {
      const user = User.create(
        'test@example.com',
        'John Doe',
        '1234567890123456789',
      );

      user.updateProfile('Jane Doe', 'https://new-avatar.url');

      expect(user.name).toBe('Jane Doe');
      expect(user.avatar).toBe('https://new-avatar.url');
    });

    it('should throw error for empty name', () => {
      const user = User.create(
        'test@example.com',
        'John Doe',
        '1234567890123456789',
      );

      expect(() => user.updateProfile('')).toThrow('Name cannot be empty');
    });

    it('should throw error for too long name', () => {
      const user = User.create(
        'test@example.com',
        'John Doe',
        '1234567890123456789',
      );

      const longName = 'a'.repeat(101);
      expect(() => user.updateProfile(longName)).toThrow('Name is too long');
    });

    it('should trim name', () => {
      const user = User.create(
        'test@example.com',
        'John Doe',
        '1234567890123456789',
      );

      user.updateProfile('  Jane Doe  ');
      expect(user.name).toBe('Jane Doe');
    });
  });

  describe('Persistence', () => {
    it('should convert to persistence format', () => {
      const user = User.create(
        'test@example.com',
        'John Doe',
        '1234567890123456789',
        'https://avatar.url',
      );

      const persistence = user.toPersistence();

      expect(persistence).toEqual({
        id: user.id,
        email: 'test@example.com',
        name: 'John Doe',
        googleId: '1234567890123456789',
        avatar: 'https://avatar.url',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    });

    it('should reconstruct from persistence', () => {
      const persistenceData = {
        id: 'test-id',
        email: 'test@example.com',
        name: 'John Doe',
        googleId: '1234567890123456789',
        avatar: 'https://avatar.url',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const user = User.fromPersistence(persistenceData);

      expect(user.id).toBe('test-id');
      expect(user.email.getValue()).toBe('test@example.com');
      expect(user.name).toBe('John Doe');
      expect(user.googleId.getValue()).toBe('1234567890123456789');
      expect(user.avatar).toBe('https://avatar.url');
    });
  });
});
