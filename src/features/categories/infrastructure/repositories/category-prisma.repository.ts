import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import { Category } from '../../domain/entities/category.entity';
import { CategoryType } from '../../domain/enums/category-type.enum';

@Injectable()
export class CategoryPrismaRepository implements ICategoryRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<Category | null> {
        const category = await this.prisma.category.findUnique({
            where: { id },
        });
        return category
            ? Category.fromPersistence({
                ...category,
                type: category.type as unknown as CategoryType,
            })
            : null;
    }

    async findByUserId(userId: string): Promise<Category[]> {
        const categories = await this.prisma.category.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
        });
        return categories.map((cat) =>
            Category.fromPersistence({
                ...cat,
                type: cat.type as unknown as CategoryType,
            }),
        );
    }

    async findByUserIdAndType(
        userId: string,
        type: CategoryType,
    ): Promise<Category[]> {
        const categories = await this.prisma.category.findMany({
            where: {
                userId,
                type,
            },
            orderBy: { createdAt: 'asc' },
        });
        return categories.map((cat) =>
            Category.fromPersistence({
                ...cat,
                type: cat.type as unknown as CategoryType,
            }),
        );
    }

    async findByUserIdAndName(
        userId: string,
        name: string,
    ): Promise<Category | null> {
        const category = await this.prisma.category.findFirst({
            where: {
                userId,
                name,
            },
        });
        return category
            ? Category.fromPersistence({
                ...category,
                type: category.type as unknown as CategoryType,
            })
            : null;
    }

    async create(category: Category): Promise<Category> {
        const data = category.toPersistence();
        const created = await this.prisma.category.create({ data });
        return Category.fromPersistence({
            ...created,
            type: created.type as unknown as CategoryType,
        });
    }

    async update(category: Category): Promise<Category> {
        const data = category.toPersistence();
        const updated = await this.prisma.category.update({
            where: { id: category.id },
            data,
        });
        return Category.fromPersistence({
            ...updated,
            type: updated.type as unknown as CategoryType,
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.category.delete({ where: { id } });
    }

    async existsByUserIdAndName(
        userId: string,
        name: string,
    ): Promise<boolean> {
        const count = await this.prisma.category.count({
            where: {
                userId,
                name,
            },
        });
        return count > 0;
    }
}
