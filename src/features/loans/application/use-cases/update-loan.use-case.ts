import {
    Inject,
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { BaseUseCase } from '@shared/application/base.use-case';
import {
    ILoanRepository,
    LOAN_REPOSITORY,
} from '../../domain/repositories/loan.repository.interface';
import { Loan } from '../../domain/entities/loan.entity';
import { LoanType } from '../../domain/enums/loan-type.enum';
import { CategoryType, TransactionType } from '@prisma/client';
import { UpdateLoanDto } from '../../infrastructure/http/dto/update-loan.dto';

export interface UpdateLoanInput {
    userId: string;
    id: string;
    dto: UpdateLoanDto;
}

@Injectable()
export class UpdateLoanUseCase
    implements BaseUseCase<UpdateLoanInput, Loan> {
    constructor(
        @Inject(LOAN_REPOSITORY)
        private readonly loanRepository: ILoanRepository,
    ) { }

    async execute(input: UpdateLoanInput): Promise<Loan> {
        const { userId, id, dto } = input;

        const loan = await this.loanRepository.findById(id);
        if (!loan || loan.userId !== userId) {
            throw new NotFoundException('Loan not found');
        }

        let categoryId = dto.categoryId !== undefined ? dto.categoryId : loan.categoryId;

        if (!categoryId) {
            const categoryName = dto.name || loan.name;
            categoryId = await this.loanRepository.createCategoryForLoan(userId, categoryName, CategoryType.EXPENSE);
        }

        if (categoryId && categoryId !== loan.categoryId) {
             const existingLoanWithCategory = await this.loanRepository.findActiveLoanByCategoryId(userId, categoryId, id);

             if (existingLoanWithCategory) {
                 throw new BadRequestException('This category is already assigned to another active loan.');
             }
        }

        if (dto.type && dto.type !== loan.type) {
            const newCategoryType = dto.type === LoanType.RECEIVED ? CategoryType.EXPENSE : CategoryType.INCOME;
            if (categoryId) {
                await this.loanRepository.updateCategoryType(categoryId, newCategoryType);
            }
        }

        loan.update({
            name: dto.name,
            initialAmount: dto.initialAmount,
            type: dto.type as LoanType,
            startDate: dto.startDate ? new Date(dto.startDate) : undefined,
            interestRate: dto.interestRate,
            categoryName: dto.categoryName,
            creditorDebtor: dto.creditorDebtor,
            notes: dto.notes,
            categoryId: categoryId || undefined,
            accountId: dto.accountId,
        });

        const updatedLoan = await this.loanRepository.update(loan);

        if (dto.initialAmount !== undefined || dto.categoryId !== undefined || dto.startDate !== undefined || dto.name !== undefined || dto.type !== undefined || dto.accountId !== undefined) {
             const transactionType = (dto.type || loan.type) === LoanType.RECEIVED
                        ? TransactionType.INCOME
                        : TransactionType.EXPENSE;
             
             await this.loanRepository.updateInitialDisbursementTransaction(
                 id,
                 dto.initialAmount || loan.initialAmount,
                 categoryId as string,
                 dto.startDate ? new Date(dto.startDate) : undefined,
                 dto.name ? `Préstamo: ${dto.name}` : undefined,
                 transactionType,
                 dto.accountId
             );
        }

        return updatedLoan;
    }
}
