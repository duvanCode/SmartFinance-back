import {
    Inject,
    Injectable,
} from '@nestjs/common';
import { BaseUseCase } from '@shared/application/base.use-case';
import {
    ILoanRepository,
    LOAN_REPOSITORY,
} from '../../domain/repositories/loan.repository.interface';
import { Loan } from '../../domain/entities/loan.entity';

@Injectable()
export class GetLoansUseCase
    implements BaseUseCase<string, Loan[]> {
    constructor(
        @Inject(LOAN_REPOSITORY)
        private readonly loanRepository: ILoanRepository,
    ) { }

    async execute(userId: string): Promise<Loan[]> {
        const loans = await this.loanRepository.findByUserId(userId);
        
        const loansWithDetails = await Promise.all(
            loans.map(loan => this.loanRepository.calculateLoanDetails(userId, loan))
        );

        return loansWithDetails;
    }
}
