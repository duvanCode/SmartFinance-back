export class CategoryColor {
  private readonly value: string;

  constructor(color: string) {
    this.validate(color);
    this.value = color.toUpperCase();
  }

  private validate(color: string): void {
    if (!color || color.trim().length === 0) {
      throw new Error('Color cannot be empty');
    }

    // Validate hex format (#RRGGBB or #RGB)
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

    if (!hexRegex.test(color)) {
      throw new Error('Invalid color format. Use hex format (#RRGGBB or #RGB)');
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: CategoryColor): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
