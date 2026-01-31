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
            include: { categories: true },
        });
        return budget ? this.toDomain(budget) : null;
    }

    async findByUserId(userId: string): Promise<Budget[]> {
        const budgets = await this.prisma.budget.findMany({
            where: { userId },
            include: { categories: true },
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
            include: { categories: true },
            orderBy: { createdAt: 'desc' },
        });
        return budgets.map((b) => this.toDomain(b));
    }



    async create(budget: Budget): Promise<Budget> {
        const { categoryIds, ...data } = budget.toPersistence() as any;
        // Don't save categoryIds directly as it's not in the model
        delete data.categoryIds;

        const created = await this.prisma.budget.create({
            data: {
                ...data,
                categories: {
                    connect: budget.categoryIds.map(id => ({ id }))
                }
            },
            include: { categories: true }
        });
        return this.toDomain(created);
    }

    async update(budget: Budget): Promise<Budget> {
        const { categoryIds, ...data } = budget.toPersistence() as any;
        // Don't save categoryIds directly as it's not in the model
        delete data.categoryIds;

        const updated = await this.prisma.budget.update({
            where: { id: budget.id },
            data: {
                ...data,
                categories: {
                    set: budget.categoryIds.map(id => ({ id })) // Replace all relations
                }
            },
            include: { categories: true }
        });
        return this.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.budget.delete({ where: { id } });
    }

    async existsActiveForCategories(
        userId: string,
        categoryIds: string[],
        period: BudgetPeriod,
        excludeId?: string,
    ): Promise<boolean> {
        const whereClause: any = {
            userId,
            period,
            isActive: true,
            categories: {
                some: {
                    id: { in: categoryIds }
                }
            }
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
            name: persistence.name,
            color: persistence.color,
            categories: persistence.categories, // Pass the included relation
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
