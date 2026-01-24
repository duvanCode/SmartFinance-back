import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import {
  ITransactionRepository,
  QueryOptions,
} from '../../domain/repositories/transaction.repository.interface';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionType } from '../../domain/enums/transaction-type.enum';
import { InputSource } from '../../domain/enums/input-source.enum';

@Injectable()
export class TransactionPrismaRepository implements ITransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Transaction | null> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    return transaction ? this.toDomain(transaction) : null;
  }

  async findByUserId(
    userId: string,
    options?: QueryOptions,
  ): Promise<Transaction[]> {
    const orderBy = this.buildOrderBy(options);

    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy,
      skip: options?.offset,
      take: options?.limit,
    });

    return transactions.map((t) => this.toDomain(t));
  }

  async findByCategoryId(categoryId: string): Promise<Transaction[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: { categoryId },
      orderBy: { date: 'desc' },
    });

    return transactions.map((t) => this.toDomain(t));
  }

  async findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Transaction[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'desc' },
    });

    return transactions.map((t) => this.toDomain(t));
  }

  async create(transaction: Transaction): Promise<Transaction> {
    const data = transaction.toPersistence();

    const created = await this.prisma.transaction.create({
      data: {
        id: data.id,
        userId: data.userId,
        categoryId: data.categoryId,
        amount: data.amount,
        type: data.type,
        description: data.description,
        date: data.date,
        source: data.source,
        rawInput: data.rawInput,
        aiConfidence: data.aiConfidence,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    });

    return this.toDomain(created);
  }

  async update(transaction: Transaction): Promise<Transaction> {
    const data = transaction.toPersistence();

    const updated = await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        categoryId: data.categoryId,
        amount: data.amount,
        description: data.description,
        date: data.date,
        updatedAt: data.updatedAt,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.transaction.delete({ where: { id } });
  }

  async getTotalByUserIdAndType(
    userId: string,
    type: TransactionType,
  ): Promise<number> {
    const result = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type,
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount?.toNumber() || 0;
  }

  async getTotalByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    type?: TransactionType,
  ): Promise<number> {
    const where: {
      userId: string;
      date: { gte: Date; lte: Date };
      type?: TransactionType;
    } = {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (type) {
      where.type = type;
    }

    const result = await this.prisma.transaction.aggregate({
      where,
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount?.toNumber() || 0;
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.transaction.count({
      where: { userId },
    });
  }

  private toDomain(data: {
    id: string;
    userId: string;
    categoryId: string;
    amount: { toNumber: () => number } | number;
    type: string;
    description: string;
    date: Date;
    source: string;
    rawInput: string | null;
    aiConfidence: number | null;
    createdAt: Date;
    updatedAt: Date;
  }): Transaction {
    return Transaction.fromPersistence({
      id: data.id,
      userId: data.userId,
      categoryId: data.categoryId,
      amount:
        typeof data.amount === 'number'
          ? { toNumber: () => data.amount as number } as any
          : data.amount as any,
      type: data.type as TransactionType,
      description: data.description,
      date: data.date,
      source: data.source as InputSource,
      rawInput: data.rawInput,
      aiConfidence: data.aiConfidence,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  private buildOrderBy(
    options?: QueryOptions,
  ): { [key: string]: 'asc' | 'desc' } {
    const orderBy = options?.orderBy || 'date';
    const direction = options?.orderDirection || 'desc';

    return { [orderBy]: direction };
  }
}
