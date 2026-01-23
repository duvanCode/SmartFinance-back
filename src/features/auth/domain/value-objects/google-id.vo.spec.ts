import { GoogleId } from './google-id.vo';

describe('GoogleId Value Object', () => {
  it('should create valid Google ID', () => {
    const googleId = new GoogleId('1234567890123456789');
    expect(googleId.getValue()).toBe('1234567890123456789');
  });

  it('should throw error for empty Google ID', () => {
    expect(() => new GoogleId('')).toThrow('Google ID cannot be empty');
  });

  it('should throw error for too short Google ID', () => {
    expect(() => new GoogleId('123')).toThrow('Invalid Google ID format');
  });

  it('should check equality correctly', () => {
    const id1 = new GoogleId('1234567890123456789');
    const id2 = new GoogleId('1234567890123456789');
    const id3 = new GoogleId('9876543210987654321');

    expect(id1.equals(id2)).toBe(true);
    expect(id1.equals(id3)).toBe(false);
  });
});
