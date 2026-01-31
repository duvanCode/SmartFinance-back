import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';
import { Loan, LoanStatus, LoanType, Prisma } from '@prisma/client';

@Injectable()
export class LoansRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: Prisma.LoanCreateInput): Promise<Loan> {
        return this.prisma.loan.create({
            data,
        });
    }

    async findOne(id: string): Promise<Loan | null> {
        return this.prisma.loan.findUnique({
            where: { id },
            include: {
                transactions: {
                    orderBy: { date: 'desc' },
                },
                category: true,
            },
        });
    }

    async findAll(userId: string): Promise<Loan[]> {
        return this.prisma.loan.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async update(id: string, data: Prisma.LoanUpdateInput): Promise<Loan> {
        return this.prisma.loan.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<Loan> {
        return this.prisma.loan.delete({
            where: { id },
        });
    }
}
