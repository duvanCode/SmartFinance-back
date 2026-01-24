import { Decimal } from '@prisma/client/runtime/library';

export class BudgetAmount {
  private readonly value: Decimal;

  constructor(amount: number | string | Decimal) {
    const decimalValue = new Decimal(amount);
    this.validate(decimalValue);
    this.value = decimalValue;
  }

  private validate(amount: Decimal): void {
    if (amount.isNaN()) {
      throw new Error('Budget amount must be a valid number');
    }

    if (amount.lessThanOrEqualTo(0)) {
      throw new Error('Budget amount must be greater than zero');
    }

    if (amount.decimalPlaces() > 2) {
      throw new Error('Budget amount cannot have more than 2 decimal places');
    }

    if (amount.greaterThan(99999999.99)) {
      throw new Error('Budget amount exceeds maximum allowed value');
    }
  }

  getValue(): Decimal {
    return this.value;
  }

  toNumber(): number {
    return this.value.toNumber();
  }

  toString(): string {
    return this.value.toFixed(2);
  }

  equals(other: BudgetAmount): boolean {
    return this.value.equals(other.value);
  }

  isGreaterThan(other: BudgetAmount): boolean {
    return this.value.greaterThan(other.value);
  }

  calculatePercentage(spent: number): number {
    if (this.value.toNumber() === 0) return 0;
    return (spent / this.value.toNumber()) * 100;
  }

  getRemainingAmount(spent: number): number {
    return Math.max(0, this.value.toNumber() - spent);
  }

  isExceeded(spent: number): boolean {
    return spent > this.value.toNumber();
  }

  format(currency: string = 'USD'): string {
    const currencySymbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      COP: '$',
    };
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${this.value.toFixed(2)}`;
  }
}
