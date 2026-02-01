import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { LoansRepository } from './loans.repository';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { RegisterPaymentDto } from './dto/register-payment.dto';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';
import { LoanType, TransactionType, LoanStatus, CategoryType } from '@prisma/client';

@Injectable()
export class LoansService {
    constructor(
        private readonly repository: LoansRepository,
        private readonly prisma: PrismaService,
    ) { }

    private async getOrCreateLoanCategory(userId: string, tx: any) {
        // Try to find a category suitable for loans/debts
        const existingCategory = await tx.category.findFirst({
            where: {
                userId,
                name: { in: ['Préstamos', 'Loans', 'Deudas', 'Debts'] },
            },
        });

        if (existingCategory) {
            return existingCategory.id;
        }

        // Create default category for loans if not exists
        // We default to EXPENSE type, but it can be used for both flows technically in this system 
        // as we only link it. The CategoryType enum forces us to choose one. 
        // Let's pick EXPENSE as "Deudas" is typically seen as a liability/expense category in simple terms, 
        // or we need two categories? For simplicity, one "Financial" category.
        const newCategory = await tx.category.create({
            data: {
                userId,
                name: 'Préstamos',
                type: CategoryType.EXPENSE,
                color: '#607D8B', // Blue-grey
                icon: 'bank',
            },
        });

        return newCategory.id;
    }

    async create(userId: string, dto: CreateLoanDto) {
        // 1. Determine transaction type based on loan type
        const transactionType =
            dto.type === LoanType.RECEIVED ? TransactionType.INCOME : TransactionType.EXPENSE;

        return this.prisma.$transaction(async (tx) => {
            let categoryId = dto.categoryId;

            // If no category provided, create a new one specific for this loan
            if (!categoryId) {
                const newCategory = await tx.category.create({
                    data: {
                        userId,
                        name: dto.name, // Use loan name for the category
                        type: CategoryType.EXPENSE, // Default to EXPENSE for loans/debts tracking
                        color: '#607D8B', // Default Blue-grey
                        icon: 'bank',
                    },
                });
                categoryId = newCategory.id;
            }

            // Check if category is already used by another active loan
            const existingLoanWithCategory = await tx.loan.findFirst({
                where: {
                    userId,
                    categoryId,
                    status: LoanStatus.ACTIVE
                }
            });

            if (existingLoanWithCategory) {
                throw new BadRequestException('This category is already assigned to another active loan. Please select a different category or create a new one.');
            }

            const finalCategoryId = categoryId as string;

            const loan = await tx.loan.create({
                data: {
                    userId,
                    name: dto.name,
                    initialAmount: dto.initialAmount,
                    pendingAmount: dto.initialAmount, // Initial state, will be calculated dynamically later
                    paidAmount: 0,
                    type: dto.type,
                    status: LoanStatus.ACTIVE,
                    startDate: new Date(dto.startDate),
                    interestRate: dto.interestRate,
                    categoryName: dto.categoryName,
                    creditorDebtor: dto.creditorDebtor,
                    notes: dto.notes,
                    categoryId: finalCategoryId,
                },
            });

            // Create initial transaction (Disbursement)
            await tx.transaction.create({
                data: {
                    userId,
                    categoryId: finalCategoryId,
                    amount: dto.initialAmount,
                    type: transactionType,
                    description: `Préstamo: ${dto.name}`,
                    date: new Date(dto.startDate),
                    isLoan: true,
                    loanId: loan.id,
                },
            });

            return loan;
        });
    }

    async findAll(userId: string) {
        const loans = await this.repository.findAll(userId);
        return Promise.all(loans.map(loan => this.calculateLoanDetails(userId, loan)));
    }

    async findOne(userId: string, id: string) {
        const loan = await this.repository.findOne(id);
        if (!loan || loan.userId !== userId) {
            throw new NotFoundException('Loan not found');
        }
        return this.calculateLoanDetails(userId, loan);
    }

    async finalize(userId: string, id: string) {
        const loan = await this.repository.findOne(id);
        if (!loan || loan.userId !== userId) {
            throw new NotFoundException('Loan not found');
        }

        return this.prisma.loan.update({
            where: { id },
            data: { status: LoanStatus.PAID }
        });
    }

    async update(userId: string, id: string, dto: UpdateLoanDto) {
        const loan = await this.repository.findOne(id);
        if (!loan || loan.userId !== userId) {
            throw new NotFoundException('Loan not found');
        }

        return this.prisma.$transaction(async (tx) => {
            let categoryId = dto.categoryId !== undefined ? dto.categoryId : loan.categoryId;

            // If no category provided and current loan has no category, create one
            if (!categoryId) {
                // Create category with loan name if provided, otherwise use existing loan name
                const categoryName = dto.name || loan.name;
                const newCategory = await tx.category.create({
                    data: {
                        userId,
                        name: categoryName,
                        type: CategoryType.EXPENSE,
                        color: '#607D8B',
                        icon: 'bank',
                    },
                });
                categoryId = newCategory.id;
            }

            // Check if new category is already used by another active loan
            if (categoryId && categoryId !== loan.categoryId) {
                const existingLoanWithCategory = await tx.loan.findFirst({
                    where: {
                        userId,
                        categoryId,
                        status: LoanStatus.ACTIVE,
                        id: { not: id }
                    }
                });

                if (existingLoanWithCategory) {
                    throw new BadRequestException('This category is already assigned to another active loan.');
                }
            }

            const updatedLoan = await tx.loan.update({
                where: { id },
                data: {
                    name: dto.name,
                    initialAmount: dto.initialAmount,
                    type: dto.type,
                    startDate: dto.startDate ? new Date(dto.startDate) : undefined,
                    interestRate: dto.interestRate,
                    categoryName: dto.categoryName,
                    creditorDebtor: dto.creditorDebtor,
                    notes: dto.notes,
                    categoryId,
                },
            });

            // Update the initial transaction if relevant fields changed
            if (dto.initialAmount !== undefined || dto.categoryId !== undefined || dto.startDate !== undefined || dto.name !== undefined || dto.type !== undefined) {
                // Find the initial transaction (marked with isLoan=true and loanId)
                const initialTransaction = await tx.transaction.findFirst({
                    where: {
                        loanId: id,
                        isLoan: true,
                    }
                });

                if (initialTransaction) {
                    const transactionType = (dto.type || loan.type) === LoanType.RECEIVED
                        ? TransactionType.INCOME
                        : TransactionType.EXPENSE;

                    await tx.transaction.update({
                        where: { id: initialTransaction.id },
                        data: {
                            amount: dto.initialAmount !== undefined ? dto.initialAmount : loan.initialAmount,
                            categoryId: categoryId,
                            date: dto.startDate ? new Date(dto.startDate) : undefined,
                            description: dto.name ? `Préstamo: ${dto.name}` : undefined,
                            type: transactionType,
                        }
                    });
                }
            }

            return updatedLoan;
        });
    }

    async delete(userId: string, id: string) {
        const loan = await this.repository.findOne(id);
        if (!loan || loan.userId !== userId) {
            throw new NotFoundException('Loan not found');
        }

        return this.prisma.$transaction(async (tx) => {
            // Delete associated transactions
            await tx.transaction.deleteMany({
                where: {
                    loanId: id,
                    userId
                }
            });

            // Delete the loan
            await tx.loan.delete({
                where: { id }
            });

            return { success: true };
        });
    }

    private async calculateLoanDetails(userId: string, loan: any) {
        if (!loan.categoryId) return loan;

        // Calculate totals from transactions associated with this category
        // For RECEIVED (Debt):
        // - Initial borrowing is INCOME (we got money) -> stored as INCOME transaction
        // - Payments are EXPENSE (we pay back) -> stored as EXPENSE transactions
        //
        // For GIVEN (Asset):
        // - Initial lending is EXPENSE (money left us) -> stored as EXPENSE transaction
        // - Payments are INCOME (we get paid back) -> stored as INCOME transactions

        const transactions = await this.prisma.transaction.findMany({
            where: {
                userId,
                categoryId: loan.categoryId,
            }
        });

        let paidAmount = 0;
        let initialDisbursement = 0;

        // Determine which transaction type corresponds to "paying back"
        const paymentType = loan.type === LoanType.RECEIVED ? TransactionType.EXPENSE : TransactionType.INCOME;
        const disbursementType = loan.type === LoanType.RECEIVED ? TransactionType.INCOME : TransactionType.EXPENSE;

        transactions.forEach(t => {
            const amount = Number(t.amount);
            if (t.type === paymentType) {
                paidAmount += amount;
            } else if (t.type === disbursementType && t.isLoan && t.loanId === loan.id) {
                // This is likely the initial loan amount transaction, strictly speaking we take the loan.initialAmount 
                // but if we want to support multiple disbursements we could sum them here. 
                // For now, let's stick to loan.initialAmount as the principal.
            }
        });

        const initialAmount = Number(loan.initialAmount);
        let pendingAmount = initialAmount - paidAmount;
        let interestAmount = 0;

        if (pendingAmount < 0) {
            // Overpaid -> Interest
            interestAmount = Math.abs(pendingAmount);
            pendingAmount = 0;
        }

        return {
            ...loan,
            paidAmount,
            pendingAmount,
            interestAmount // Virtual field, not in DB
        };
    }


}
