import { Decimal } from '@prisma/client/runtime/library';
import { BaseEntity } from '@shared/domain/base.entity';
import { BudgetAmount } from '../value-objects/budget-amount.vo';
import { BudgetPeriod } from '../enums/budget-period.enum';

export interface BudgetProps {
  id: string;
  userId: string;
  categoryId: string;
  amount: BudgetAmount;
  period: BudgetPeriod;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BudgetStatus {
  budgetId: string;
  categoryId: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  isExceeded: boolean;
  alertLevel: 'normal' | 'warning' | 'danger' | 'exceeded';
}

export class Budget extends BaseEntity {
  private _userId: string;
  private _categoryId: string;
  private _amount: BudgetAmount;
  private _period: BudgetPeriod;
  private _startDate?: Date;
  private _endDate?: Date;
  private _isActive: boolean;

  constructor(props: BudgetProps) {
    super({
      id: props.id,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
    this._userId = props.userId;
    this._categoryId = props.categoryId;
    this._amount = props.amount;
    this._period = props.period;
    this._startDate = props.startDate;
    this._endDate = props.endDate;
    this._isActive = props.isActive ?? true;
  }

  // Getters
  get userId(): string {
    return this._userId;
  }

  get categoryId(): string {
    return this._categoryId;
  }

  get amount(): BudgetAmount {
    return this._amount;
  }

  get period(): BudgetPeriod {
    return this._period;
  }

  get startDate(): Date | undefined {
    return this._startDate;
  }

  get endDate(): Date | undefined {
    return this._endDate;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  // Business methods
  update(amount: BudgetAmount, period?: BudgetPeriod): void {
    this._amount = amount;
    if (period) {
      this._period = period;
    }
    this.updateTimestamp();
  }

  deactivate(): void {
    this._isActive = false;
    this.updateTimestamp();
  }

  activate(): void {
    this._isActive = true;
    this.updateTimestamp();
  }

  calculateStatus(spentAmount: number): BudgetStatus {
    const budgetAmount = this._amount.toNumber();
    const remainingAmount = Math.max(0, budgetAmount - spentAmount);
    const percentageUsed = this._amount.calculatePercentage(spentAmount);
    const isExceeded = this._amount.isExceeded(spentAmount);

    let alertLevel: 'normal' | 'warning' | 'danger' | 'exceeded' = 'normal';
    if (isExceeded) {
      alertLevel = 'exceeded';
    } else if (percentageUsed >= 90) {
      alertLevel = 'danger';
    } else if (percentageUsed >= 80) {
      alertLevel = 'warning';
    }

    return {
      budgetId: this.id,
      categoryId: this._categoryId,
      budgetAmount,
      spentAmount,
      remainingAmount,
      percentageUsed: Math.round(percentageUsed * 100) / 100,
      isExceeded,
      alertLevel,
    };
  }

  getPeriodDateRange(): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (this._period) {
      case BudgetPeriod.DAILY:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case BudgetPeriod.WEEKLY:
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startDate = new Date(now.getFullYear(), now.getMonth(), diff);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case BudgetPeriod.MONTHLY:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case BudgetPeriod.YEARLY:
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
    }

    // Override with custom dates if provided
    if (this._startDate) {
      startDate = this._startDate;
    }
    if (this._endDate) {
      endDate = this._endDate;
    }

    return { startDate, endDate };
  }

  // Factory method
  static create(
    userId: string,
    categoryId: string,
    amount: number,
    period: BudgetPeriod,
    startDate?: Date,
    endDate?: Date,
  ): Budget {
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID cannot be empty');
    }
    if (!categoryId || categoryId.trim().length === 0) {
      throw new Error('Category ID cannot be empty');
    }

    return new Budget({
      id: crypto.randomUUID(),
      userId,
      categoryId,
      amount: new BudgetAmount(amount),
      period,
      startDate,
      endDate,
      isActive: true,
    });
  }

  // Persistence methods
  toPersistence() {
    return {
      id: this.id,
      userId: this._userId,
      categoryId: this._categoryId,
      amount: this._amount.getValue(),
      period: this._period,
      startDate: this._startDate,
      endDate: this._endDate,
      isActive: this._isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromPersistence(data: {
    id: string;
    userId: string;
    categoryId: string;
    amount: Decimal;
    period: BudgetPeriod;
    startDate: Date | null;
    endDate: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Budget {
    return new Budget({
      id: data.id,
      userId: data.userId,
      categoryId: data.categoryId,
      amount: new BudgetAmount(data.amount),
      period: data.period,
      startDate: data.startDate ?? undefined,
      endDate: data.endDate ?? undefined,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
