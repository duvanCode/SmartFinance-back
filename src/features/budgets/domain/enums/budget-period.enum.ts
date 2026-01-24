export enum BudgetPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export function getBudgetPeriodFromString(value: string): BudgetPeriod {
  const normalized = value?.toUpperCase()?.trim();
  if (normalized === 'DAILY') return BudgetPeriod.DAILY;
  if (normalized === 'WEEKLY') return BudgetPeriod.WEEKLY;
  if (normalized === 'MONTHLY') return BudgetPeriod.MONTHLY;
  if (normalized === 'YEARLY') return BudgetPeriod.YEARLY;
  throw new Error(
    `Invalid budget period: ${value}. Must be DAILY, WEEKLY, MONTHLY, or YEARLY`,
  );
}

export function getPeriodDays(period: BudgetPeriod): number {
  switch (period) {
    case BudgetPeriod.DAILY:
      return 1;
    case BudgetPeriod.WEEKLY:
      return 7;
    case BudgetPeriod.MONTHLY:
      return 30;
    case BudgetPeriod.YEARLY:
      return 365;
  }
}
