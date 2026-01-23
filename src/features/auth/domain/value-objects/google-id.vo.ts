export class GoogleId {
  private readonly value: string;

  constructor(googleId: string) {
    this.validate(googleId);
    this.value = googleId;
  }

  private validate(googleId: string): void {
    if (!googleId || googleId.trim().length === 0) {
      throw new Error('Google ID cannot be empty');
    }

    if (googleId.length < 10) {
      throw new Error('Invalid Google ID format');
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: GoogleId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
