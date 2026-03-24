import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { ILoanRepository } from '../../domain/repositories/loan.repository.interface';
import { Loan } from '../../domain/entities/loan.entity';
import { LoanType, LoanStatus, TransactionType, CategoryType, LoanType as PrismaLoanType, LoanStatus as PrismaLoanStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class LoanPrismaRepository implements ILoanRepository {
  constructor(private readonly prisma: PrismaService) { }

  private mapToDomain(prismaLoan: any): Loan {
    return Loan.fromPersistence({
      ...prismaLoan,
      type: prismaLoan.type as unknown as import('../../domain/enums/loan-type.enum').LoanType,
      status: prismaLoan.status as unknown as import('../../domain/enums/loan-status.enum').LoanStatus,
      initialAmount: Number(prismaLoan.initialAmount),
      paidAmount: Number(prismaLoan.paidAmount),
      pendingAmount: Number(prismaLoan.pendingAmount),
      interestRate: prismaLoan.interestRate ? Number(prismaLoan.interestRate) : null,
    });
  }

  async findById(id: string): Promise<Loan | null> {
    const loan = await this.prisma.loan.findUnique({ where: { id } });
    return loan ? this.mapToDomain(loan) : null;
  }

  async findByUserId(userId: string): Promise<Loan[]> {
    const loans = await this.prisma.loan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return loans.map(loan => this.mapToDomain(loan));
  }

  async create(loan: Loan): Promise<Loan> {
    const data = loan.toPersistence();
    const created = await this.prisma.loan.create({
      data: {
        ...data,
        type: data.type as unknown as PrismaLoanType,
        status: data.status as unknown as PrismaLoanStatus,
        initialAmount: new Decimal(data.initialAmount),
        paidAmount: new Decimal(data.paidAmount),
        pendingAmount: new Decimal(data.pendingAmount),
        interestRate: data.interestRate ? new Decimal(data.interestRate) : null,
      },
    });
    return this.mapToDomain(created);
  }

  async update(loan: Loan): Promise<Loan> {
    const data = loan.toPersistence();
    const { id, userId, createdAt, updatedAt, ...updateData } = data;
    
    const updated = await this.prisma.loan.update({
      where: { id },
      data: {
        ...updateData,
        type: updateData.type as unknown as PrismaLoanType,
        status: updateData.status as unknown as PrismaLoanStatus,
        initialAmount: new Decimal(updateData.initialAmount),
        paidAmount: new Decimal(updateData.paidAmount),
        pendingAmount: new Decimal(updateData.pendingAmount),
        interestRate: updateData.interestRate ? new Decimal(updateData.interestRate) : null,
      },
    });
    return this.mapToDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.loan.delete({ where: { id } });
  }

  // --- External Logic from Old Service ---

  async findActiveLoanByCategoryId(userId: string, categoryId: string, excludeLoanId?: string): Promise<Loan | null> {
      const whereClause: any = {
          userId,
          categoryId,
          status: PrismaLoanStatus.ACTIVE
      };
      
      if (excludeLoanId) {
          whereClause.id = { not: excludeLoanId };
      }

      const loan = await this.prisma.loan.findFirst({
        where: whereClause
      });

      return loan ? this.mapToDomain(loan) : null;
  }

  async getOrCreateLoanCategory(userId: string): Promise<string> {
    const existingCategory = await this.prisma.category.findFirst({
        where: {
            userId,
            name: { in: ['Préstamos', 'Loans', 'Deudas', 'Debts'] },
        },
    });

    if (existingCategory) {
        return existingCategory.id;
    }

    const newCategory = await this.prisma.category.create({
        data: {
            userId,
            name: 'Préstamos',
            type: CategoryType.EXPENSE,
            color: '#607D8B', 
            icon: 'bank',
        },
    });

    return newCategory.id;
  }

  async createCategoryForLoan(userId: string, name: string, type: string): Promise<string> {
      const newCategory = await this.prisma.category.create({
          data: {
              userId,
              name,
              type: type as CategoryType,
              color: '#607D8B',
              icon: 'bank',
          },
      });
      return newCategory.id;
  }

  async updateCategoryType(categoryId: string, type: string): Promise<void> {
      await this.prisma.category.update({
          where: { id: categoryId },
          data: { type: type as CategoryType }
      });
  }

  async createInitialDisbursementTransaction(
      userId: string, 
      categoryId: string, 
      amount: number, 
      type: string, 
      description: string, 
      date: Date, 
      loanId: string,
      accountId: string
  ): Promise<void> {
        await this.prisma.transaction.create({
            data: {
                userId,
                categoryId,
                accountId,
                amount: new Decimal(amount),
                type: type as TransactionType,
                description,
                date,
                isLoan: true,
                loanId,
            },
        });
  }

  async updateInitialDisbursementTransaction(
      loanId: string, 
      amount: number, 
      categoryId: string, 
      date: Date | undefined, 
      description: string | undefined, 
      type: string
  ): Promise<void> {
      const initialTransaction = await this.prisma.transaction.findFirst({
          where: { loanId, isLoan: true }
      });

      if (initialTransaction) {
          await this.prisma.transaction.update({
              where: { id: initialTransaction.id },
              data: {
                  amount: amount !== undefined ? new Decimal(amount) : undefined,
                  categoryId,
                  date,
                  description,
                  type: type as TransactionType,
              }
          });
      }
  }

  async deleteTransactionsByLoanId(loanId: string, userId: string): Promise<void> {
      await this.prisma.transaction.deleteMany({
          where: { loanId, userId }
      });
  }

  async calculateLoanDetails(userId: string, loan: Loan): Promise<Loan> {
      if (!loan.categoryId) return loan;

      const transactions = await this.prisma.transaction.findMany({
          where: { userId, categoryId: loan.categoryId }
      });

      let paidAmount = 0;
      
      const paymentType = loan.type === 'RECEIVED' ? TransactionType.EXPENSE : TransactionType.INCOME;
      
      transactions.forEach(t => {
          const amount = Number(t.amount);
          if (t.type === paymentType) {
              paidAmount += amount;
          }
      });

      let pendingAmount = loan.initialAmount - paidAmount;
      let interestAmount = 0;

      if (pendingAmount < 0) {
          interestAmount = Math.abs(pendingAmount);
          pendingAmount = 0;
      }

      loan.setCalculatedTotals(paidAmount, pendingAmount, interestAmount);
      return loan;
  }
}
