import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { IBudgetRepository } from '../../domain/repositories/budget.repository.interface';
import { Budget } from '../../domain/entities/budget.entity';
import { BudgetPeriod } from '../../domain/enums/budget-period.enum';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class BudgetPrismaRepository implements IBudgetRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<Budget | null> {
        const budget = await this.prisma.budget.findUnique({
            where: { id },
        });
        return budget ? this.toDomain(budget) : null;
    }

    async findByUserId(userId: string): Promise<Budget[]> {
        const budgets = await this.prisma.budget.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return budgets.map((b) => this.toDomain(b));
    }

    async findActiveByUserId(userId: string): Promise<Budget[]> {
        const budgets = await this.prisma.budget.findMany({
            where: {
                userId,
                isActive: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return budgets.map((b) => this.toDomain(b));
    }

    async findByUserIdAndCategoryId(
        userId: string,
        categoryId: string,
    ): Promise<Budget | null> {
        const budget = await this.prisma.budget.findFirst({
            where: {
                userId,
                categoryId,
            },
            orderBy: { createdAt: 'desc' },
        });
        return budget ? this.toDomain(budget) : null;
    }

    async findActiveByUserIdAndCategoryId(
        userId: string,
        categoryId: string,
        period: BudgetPeriod,
    ): Promise<Budget | null> {
        const budget = await this.prisma.budget.findFirst({
            where: {
                userId,
                categoryId,
                period,
                isActive: true,
            },
        });
        return budget ? this.toDomain(budget) : null;
    }

    async create(budget: Budget): Promise<Budget> {
        const data = budget.toPersistence();
        const created = await this.prisma.budget.create({ data });
        return this.toDomain(created);
    }

    async update(budget: Budget): Promise<Budget> {
        const data = budget.toPersistence();
        const updated = await this.prisma.budget.update({
            where: { id: budget.id },
            data,
        });
        return this.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.budget.delete({ where: { id } });
    }

    async existsActiveForCategory(
        userId: string,
        categoryId: string,
        period: BudgetPeriod,
        excludeId?: string,
    ): Promise<boolean> {
        const whereClause: any = {
            userId,
            categoryId,
            period,
            isActive: true,
        };

        if (excludeId) {
            whereClause.id = { not: excludeId };
        }

        const count = await this.prisma.budget.count({
            where: whereClause,
        });

        return count > 0;
    }

    private toDomain(persistence: any): Budget {
        return Budget.fromPersistence({
            id: persistence.id,
            userId: persistence.userId,
            categoryId: persistence.categoryId,
            amount: new Decimal(persistence.amount),
            period: persistence.period as BudgetPeriod,
            startDate: persistence.startDate,
            endDate: persistence.endDate,
            isActive: persistence.isActive,
            createdAt: persistence.createdAt,
            updatedAt: persistence.updatedAt,
        });
    }
}
