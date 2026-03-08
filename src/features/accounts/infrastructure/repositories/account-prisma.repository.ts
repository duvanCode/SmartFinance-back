import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { IAccountRepository } from '../../domain/repositories/account.repository.interface';
import { Account } from '../../domain/entities/account.entity';
import { AccountType } from '../../domain/enums/account-type.enum';
import { TransactionType, AccountType as PrismaAccountType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class AccountPrismaRepository implements IAccountRepository {
  constructor(private readonly prisma: PrismaService) { }

  private mapToDomain(prismaAccount: any): Account {
    return Account.fromPersistence({
      ...prismaAccount,
      type: prismaAccount.type as unknown as AccountType,
      snapshotBalance: Number(prismaAccount.snapshotBalance),
      creditLimit: prismaAccount.creditLimit ? Number(prismaAccount.creditLimit) : null,
      balance: prismaAccount.balance !== undefined ? prismaAccount.balance : undefined,
    });
  }

  async findById(id: string, userId: string): Promise<Account | null> {
    const account = await this.prisma.account.findUnique({
      where: { id, userId },
    });
    return account ? this.mapToDomain(account) : null;
  }

  async findByUserId(userId: string): Promise<Account[]> {
    const accounts = await this.prisma.account.findMany({
      where: { userId, type: { not: PrismaAccountType.SYSTEM } },
      orderBy: { createdAt: 'desc' },
    });
    return accounts.map(acc => this.mapToDomain(acc));
  }

  async create(account: Account): Promise<Account> {
    const data = account.toPersistence();
    const created = await this.prisma.account.create({
      data: {
        ...data,
        type: data.type as unknown as PrismaAccountType,
        snapshotBalance: new Decimal(data.snapshotBalance),
        creditLimit: data.creditLimit ? new Decimal(data.creditLimit) : null,
      },
    });
    return this.mapToDomain(created);
  }

  async update(account: Account): Promise<Account> {
    const data = account.toPersistence();
    const { id, userId, createdAt, updatedAt, ...updateData } = data;
    
    const updated = await this.prisma.account.update({
      where: { id },
      data: {
        ...updateData,
        type: updateData.type as unknown as PrismaAccountType,
        snapshotBalance: new Decimal(updateData.snapshotBalance),
        creditLimit: updateData.creditLimit ? new Decimal(updateData.creditLimit) : null,
      },
    });
    return this.mapToDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.account.delete({ where: { id } });
  }

  // --- Snapshot Calculation Logic ported from old service ---

  async calculateCurrentBalance(accountId: string, userId: string): Promise<number> {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId, userId },
    });

    if (!account) throw new NotFoundException('Account not found');

    if (account.snapshotDirty || account.transactionsSinceSnapshot >= 50) {
      return this.recalculateSnapshot(accountId, userId);
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        accountId,
        userId,
        createdAt: { gt: account.snapshotDate },
      },
      select: { amount: true, type: true },
    });

    let balance = Number(account.snapshotBalance);

    for (const tx of transactions) {
      const amount = Number(tx.amount);
      if (account.type === PrismaAccountType.CREDIT_CARD) {
        if (tx.type === TransactionType.EXPENSE) balance += amount;
        else balance -= amount;
      } else {
        if (tx.type === TransactionType.INCOME) balance += amount;
        else balance -= amount;
      }
    }

    return balance;
  }

  async recalculateSnapshot(accountId: string, userId: string): Promise<number> {
    const account = await this.prisma.account.findUnique({ where: { id: accountId } });
    if (!account) throw new NotFoundException('Account not found');

    const incomes = await this.prisma.transaction.aggregate({
      where: { accountId, userId, type: TransactionType.INCOME },
      _sum: { amount: true },
    });
    const incomeAmount = Number(incomes._sum.amount || 0);

    const expenses = await this.prisma.transaction.aggregate({
      where: { accountId, userId, type: TransactionType.EXPENSE },
      _sum: { amount: true },
    });
    const expenseAmount = Number(expenses._sum.amount || 0);

    let newBalance = 0;
    if (account.type === PrismaAccountType.CREDIT_CARD) {
      newBalance = expenseAmount - incomeAmount; // Debt
    } else {
      newBalance = incomeAmount - expenseAmount; // Cash
    }

    await this.prisma.account.update({
      where: { id: accountId },
      data: {
        snapshotBalance: newBalance,
        snapshotDate: new Date(),
        transactionsSinceSnapshot: 0,
        snapshotDirty: false,
      },
    });

    return newBalance;
  }

  async countTransactionsByAccountId(accountId: string): Promise<number> {
    return this.prisma.transaction.count({
      where: { accountId }
    });
  }

  async findSystemAccount(userId: string): Promise<Account | null> {
    const account = await this.prisma.account.findFirst({
        where: { userId, type: PrismaAccountType.SYSTEM, name: 'Sin asignar' },
    });
    return account ? this.mapToDomain(account) : null;
  }

  async createInitialDebtTransaction(
    userId: string, 
    accountId: string, 
    amount: number, 
    currency: string
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
        let category = await tx.category.findFirst({
            where: { userId, name: 'Saldo Inicial Tarjeta', type: 'EXPENSE' },
        });

        if (!category) {
            category = await tx.category.create({
                data: {
                    userId,
                    name: 'Saldo Inicial Tarjeta',
                    type: 'EXPENSE',
                    color: '#EF4444',
                    icon: 'credit-card',
                    isDefault: false,
                },
            });
        }

        await tx.transaction.create({
            data: {
                userId,
                accountId,
                categoryId: category.id,
                amount: new Decimal(amount),
                type: TransactionType.EXPENSE,
                description: 'Saldo inicial (deuda) de tarjeta de crédito',
                date: new Date(),
                currency,
            },
        });
    });
  }

  async assignOrphanTransactionsToAccount(userId: string, targetAccountId: string): Promise<number> {
    const updateResult = await this.prisma.transaction.updateMany({
        where: { userId, accountId: null },
        data: { accountId: targetAccountId },
    });
    return updateResult.count;
  }
}
