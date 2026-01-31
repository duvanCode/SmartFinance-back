import { Budget } from '../entities/budget.entity';
import { BudgetPeriod } from '../enums/budget-period.enum';

export interface IBudgetRepository {
  findById(id: string): Promise<Budget | null>;
  findByUserId(userId: string): Promise<Budget[]>;
  findActiveByUserId(userId: string): Promise<Budget[]>;
  create(budget: Budget): Promise<Budget>;
  update(budget: Budget): Promise<Budget>;
  delete(id: string): Promise<void>;
  existsActiveForCategories(
    userId: string,
    categoryIds: string[],
    period: BudgetPeriod,
    excludeId?: string,
  ): Promise<boolean>;
}

export const BUDGET_REPOSITORY = Symbol('BUDGET_REPOSITORY');
