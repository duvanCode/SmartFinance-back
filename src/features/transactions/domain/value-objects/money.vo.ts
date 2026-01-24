import { Decimal } from '@prisma/client/runtime/library';

export class Money {
  private readonly value: Decimal;

  constructor(amount: number | string | Decimal) {
    const decimalValue = new Decimal(amount);
    this.validate(decimalValue);
    this.value = decimalValue;
  }

  private validate(amount: Decimal): void {
    if (amount.isNaN()) {
      throw new Error('Amount must be a valid number');
    }

    if (amount.lessThanOrEqualTo(0)) {
      throw new Error('Amount must be greater than zero');
    }

    if (amount.decimalPlaces() > 2) {
      throw new Error('Amount cannot have more than 2 decimal places');
    }

    if (amount.greaterThan(99999999.99)) {
      throw new Error('Amount exceeds maximum allowed value');
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

  equals(other: Money): boolean {
    return this.value.equals(other.value);
  }

  isGreaterThan(other: Money): boolean {
    return this.value.greaterThan(other.value);
  }

  isLessThan(other: Money): boolean {
    return this.value.lessThan(other.value);
  }

  add(other: Money): Money {
    return new Money(this.value.plus(other.value));
  }

  subtract(other: Money): Money {
    const result = this.value.minus(other.value);
    if (result.lessThanOrEqualTo(0)) {
      throw new Error('Resulting amount must be greater than zero');
    }
    return new Money(result);
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
