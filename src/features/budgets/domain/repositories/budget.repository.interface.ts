import { Budget } from '../entities/budget.entity';
import { BudgetPeriod } from '../enums/budget-period.enum';

export interface IBudgetRepository {
  findById(id: string): Promise<Budget | null>;
  findByUserId(userId: string): Promise<Budget[]>;
  findActiveByUserId(userId: string): Promise<Budget[]>;
  findByUserIdAndCategoryId(
    userId: string,
    categoryId: string,
  ): Promise<Budget | null>;
  findActiveByUserIdAndCategoryId(
    userId: string,
    categoryId: string,
    period: BudgetPeriod,
  ): Promise<Budget | null>;
  create(budget: Budget): Promise<Budget>;
  update(budget: Budget): Promise<Budget>;
  delete(id: string): Promise<void>;
  existsActiveForCategory(
    userId: string,
    categoryId: string,
    period: BudgetPeriod,
    excludeId?: string,
  ): Promise<boolean>;
}

export const BUDGET_REPOSITORY = Symbol('BUDGET_REPOSITORY');
