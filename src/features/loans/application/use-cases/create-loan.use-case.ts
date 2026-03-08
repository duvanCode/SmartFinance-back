import {
    Inject,
    Injectable,
    BadRequestException,
} from '@nestjs/common';
import { BaseUseCase } from '@shared/application/base.use-case';
import {
    ILoanRepository,
    LOAN_REPOSITORY,
} from '../../domain/repositories/loan.repository.interface';
import { Loan } from '../../domain/entities/loan.entity';
import { LoanType } from '../../domain/enums/loan-type.enum';
import { TransactionType, CategoryType } from '@prisma/client';
import { CreateLoanDto } from '../../infrastructure/http/dto/create-loan.dto';

@Injectable()
export class CreateLoanUseCase
    implements BaseUseCase<{ userId: string; dto: CreateLoanDto }, Loan> {
    constructor(
        @Inject(LOAN_REPOSITORY)
        private readonly loanRepository: ILoanRepository,
    ) { }

    async execute(input: { userId: string; dto: CreateLoanDto }): Promise<Loan> {
        const { userId, dto } = input;

        const transactionType =
            dto.type === LoanType.RECEIVED ? TransactionType.INCOME : TransactionType.EXPENSE;
        
        let categoryId = dto.categoryId;

        if (!categoryId) {
            const categoryType = dto.type === LoanType.RECEIVED ? CategoryType.EXPENSE : CategoryType.INCOME;
            categoryId = await this.loanRepository.createCategoryForLoan(userId, dto.name, categoryType);
        }

        const existingLoanWithCategory = await this.loanRepository.findActiveLoanByCategoryId(userId, categoryId);

        if (existingLoanWithCategory) {
            throw new BadRequestException('This category is already assigned to another active loan. Please select a different category or create a new one.');
        }

        const loan = Loan.create({
            userId,
            name: dto.name,
            initialAmount: dto.initialAmount,
            type: dto.type as LoanType,
            interestRate: dto.interestRate,
            startDate: new Date(dto.startDate),
            categoryName: dto.categoryName,
            creditorDebtor: dto.creditorDebtor,
            notes: dto.notes,
            categoryId,
        });

        const createdLoan = await this.loanRepository.create(loan);

        await this.loanRepository.createInitialDisbursementTransaction(
            userId,
            categoryId,
            dto.initialAmount,
            transactionType,
            `Préstamo: ${dto.name}`,
            new Date(dto.startDate),
            createdLoan.id
        );

        return createdLoan;
    }
}
