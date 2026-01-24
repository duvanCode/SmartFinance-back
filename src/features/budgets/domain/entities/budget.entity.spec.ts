import { Budget } from './budget.entity';
import { BudgetPeriod } from '../enums/budget-period.enum';
import { BudgetAmount } from '../value-objects/budget-amount.vo';
import { Decimal } from '@prisma/client/runtime/library';

describe('Budget Entity', () => {
    describe('Creation', () => {
        it('should create budget with valid data', () => {
            const budget = Budget.create(
                'user-123',
                'category-123',
                500.00,
                BudgetPeriod.MONTHLY,
            );

            expect(budget.userId).toBe('user-123');
            expect(budget.categoryId).toBe('category-123');
            expect(budget.amount.toNumber()).toBe(500.00);
            expect(budget.period).toBe(BudgetPeriod.MONTHLY);
            expect(budget.isActive).toBe(true);
        });

        it('should throw error for invalid amount', () => {
            expect(() => {
                Budget.create(
                    'user-123',
                    'category-123',
                    -100,
                    BudgetPeriod.MONTHLY,
                );
            }).toThrow();
        });
    });

    describe('Business Logic', () => {
        let budget: Budget;

        beforeEach(() => {
            budget = Budget.create(
                'user-123',
                'category-123',
                1000.00,
                BudgetPeriod.MONTHLY,
            );
        });

        it('should calculate status status correctly', () => {
            const status = budget.calculateStatus(500.00);

            expect(status.budgetAmount).toBe(1000.00);
            expect(status.spentAmount).toBe(500.00);
            expect(status.remainingAmount).toBe(500.00);
            expect(status.percentageUsed).toBe(50.00);
            expect(status.alertLevel).toBe('normal');
        });

        it('should set warning alert level when usage >= 80%', () => {
            const status = budget.calculateStatus(850.00);
            expect(status.alertLevel).toBe('warning');
        });

        it('should set danger alert level when usage >= 90%', () => {
            const status = budget.calculateStatus(950.00);
            expect(status.alertLevel).toBe('danger');
        });

        it('should set exceeded alert level when usage > 100%', () => {
            const status = budget.calculateStatus(1001.00);
            expect(status.alertLevel).toBe('exceeded');
            expect(status.isExceeded).toBe(true);
        });

        it('should update amount and period', () => {
            budget.update(new BudgetAmount(2000.00), BudgetPeriod.YEARLY);

            expect(budget.amount.toNumber()).toBe(2000.00);
            expect(budget.period).toBe(BudgetPeriod.YEARLY);
        });
    });
});
