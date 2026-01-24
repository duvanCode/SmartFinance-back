export class TransactionDate {
  private readonly value: Date;

  constructor(date: Date | string) {
    const dateValue = date instanceof Date ? date : new Date(date);
    this.validate(dateValue);
    this.value = dateValue;
  }

  private validate(date: Date): void {
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    if (date > today) {
      throw new Error('Transaction date cannot be in the future');
    }

    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

    if (date < tenYearsAgo) {
      throw new Error('Transaction date cannot be more than 10 years in the past');
    }
  }

  getValue(): Date {
    return this.value;
  }

  equals(other: TransactionDate): boolean {
    return this.value.getTime() === other.value.getTime();
  }

  isBefore(other: TransactionDate): boolean {
    return this.value.getTime() < other.value.getTime();
  }

  isAfter(other: TransactionDate): boolean {
    return this.value.getTime() > other.value.getTime();
  }

  format(): string {
    return this.value.toISOString();
  }

  toDateString(): string {
    return this.value.toISOString().split('T')[0];
  }

  toString(): string {
    return this.format();
  }
}
