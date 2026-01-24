export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export function getTransactionTypeFromString(value: string): TransactionType {
  const normalized = value?.toUpperCase()?.trim();
  if (normalized === 'INCOME') return TransactionType.INCOME;
  if (normalized === 'EXPENSE') return TransactionType.EXPENSE;
  throw new Error(`Invalid transaction type: ${value}. Must be INCOME or EXPENSE`);
}
