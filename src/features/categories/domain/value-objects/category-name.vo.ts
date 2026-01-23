export class CategoryName {
  private readonly value: string;

  constructor(name: string) {
    this.validate(name);
    this.value = name.trim();
  }

  private validate(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Category name cannot be empty');
    }

    if (name.trim().length < 2) {
      throw new Error('Category name must be at least 2 characters');
    }

    if (name.length > 50) {
      throw new Error('Category name is too long (max 50 characters)');
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: CategoryName): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  toString(): string {
    return this.value;
  }
}
