import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { DateRange } from '../../domain/value-objects/date-range.vo';
import { TransactionType } from '@features/transactions/domain/enums/transaction-type.enum';
import { CategoryType } from '@features/categories/domain/enums/category-type.enum';

export interface SpendingByCategory {
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    categoryIcon: string;
    amount: number;
    percentage: number;
}

export interface IncomeVsExpenses {
    income: number;
    expenses: number;
    balance: number;
}

export interface SpendingTrend {
    period: string;
    amount: number;
}

@Injectable()
export class AnalyticsService {
    constructor(private readonly prisma: PrismaService) { }

    async getSpendingByCategory(
        userId: string,
        range: DateRange,
    ): Promise<SpendingByCategory[]> {
        // 1. Get all expenses in range
        const transactions = await this.prisma.transaction.findMany({
            where: {
                userId,
                type: TransactionType.EXPENSE,
                date: {
                    gte: range.startDate,
                    lte: range.endDate,
                },
            },
            include: {
                category: true,
            },
        });

        if (transactions.length === 0) {
            return [];
        }

        // 2. Group by category and sum
        const totalSpending = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
        const categoryMap = new Map<string, SpendingByCategory>();

        for (const t of transactions) {
            if (!t.category) continue;

            const current = categoryMap.get(t.categoryId) || {
                categoryId: t.categoryId,
                categoryName: t.category.name,
                categoryColor: t.category.color,
                categoryIcon: t.category.icon,
                amount: 0,
                percentage: 0,
            };

            current.amount += Number(t.amount);
            categoryMap.set(t.categoryId, current);
        }

        // 3. Calculate percentages and sort
        const result = Array.from(categoryMap.values());
        result.forEach((item) => {
            item.percentage = totalSpending > 0
                ? parseFloat(((item.amount / totalSpending) * 100).toFixed(2))
                : 0;
            item.amount = parseFloat(item.amount.toFixed(2));
        });

        return result.sort((a, b) => b.amount - a.amount);
    }

    async getIncomeVsExpenses(
        userId: string,
        range: DateRange,
    ): Promise<IncomeVsExpenses> {
        const aggregations = await this.prisma.transaction.groupBy({
            by: ['type'],
            where: {
                userId,
                date: {
                    gte: range.startDate,
                    lte: range.endDate,
                },
            },
            _sum: {
                amount: true,
            },
        });

        let income = 0;
        let expenses = 0;

        aggregations.forEach((curr) => {
            const amount = Number(curr._sum.amount || 0);
            if (curr.type === TransactionType.INCOME) {
                income = amount;
            } else if (curr.type === TransactionType.EXPENSE) {
                expenses = amount;
            }
        });

        return {
            income,
            expenses,
            balance: income - expenses,
        };
    }

    async getMonthlyComparison(userId: string) {
        const currentMonth = DateRange.currentMonth();
        const previousMonth = DateRange.previousMonth();

        const currentStats = await this.getIncomeVsExpenses(userId, currentMonth);
        const previousStats = await this.getIncomeVsExpenses(userId, previousMonth);

        const calculateChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return parseFloat((((current - previous) / previous) * 100).toFixed(2));
        };

        return {
            currentMonth: {
                ...currentStats,
                period: currentMonth
            },
            previousMonth: {
                ...previousStats,
                period: previousMonth
            },
            changes: {
                incomePercentage: calculateChange(currentStats.income, previousStats.income),
                expensesPercentage: calculateChange(currentStats.expenses, previousStats.expenses),
                balancePercentage: calculateChange(currentStats.balance, previousStats.balance),
            }
        };
    }
}
