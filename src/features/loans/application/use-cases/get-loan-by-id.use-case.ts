import {
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { BaseUseCase } from '@shared/application/base.use-case';
import {
    ILoanRepository,
    LOAN_REPOSITORY,
} from '../../domain/repositories/loan.repository.interface';
import { Loan } from '../../domain/entities/loan.entity';

export interface GetLoanByIdInput {
    userId: string;
    id: string;
}

@Injectable()
export class GetLoanByIdUseCase
    implements BaseUseCase<GetLoanByIdInput, Loan> {
    constructor(
        @Inject(LOAN_REPOSITORY)
        private readonly loanRepository: ILoanRepository,
    ) { }

    async execute(input: GetLoanByIdInput): Promise<Loan> {
        const loan = await this.loanRepository.findById(input.id);
        
        if (!loan || loan.userId !== input.userId) {
            throw new NotFoundException('Loan not found');
        }

        return this.loanRepository.calculateLoanDetails(input.userId, loan);
    }
}
