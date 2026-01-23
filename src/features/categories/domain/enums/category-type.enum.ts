export enum CategoryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export const getCategoryTypeFromString = (value: string): CategoryType => {
  const upperValue = value.toUpperCase();

  if (upperValue === 'INCOME') return CategoryType.INCOME;
  if (upperValue === 'EXPENSE') return CategoryType.EXPENSE;

  throw new Error(`Invalid category type: ${value}`);
};
