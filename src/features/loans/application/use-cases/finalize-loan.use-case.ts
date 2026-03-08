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

export interface FinalizeLoanInput {
    userId: string;
    id: string;
}

@Injectable()
export class FinalizeLoanUseCase
    implements BaseUseCase<FinalizeLoanInput, void> {
    constructor(
        @Inject(LOAN_REPOSITORY)
        private readonly loanRepository: ILoanRepository,
    ) { }

    async execute(input: FinalizeLoanInput): Promise<void> {
        const loan = await this.loanRepository.findById(input.id);
        
        if (!loan || loan.userId !== input.userId) {
            throw new NotFoundException('Loan not found');
        }

        loan.markAsPaid();
        await this.loanRepository.update(loan);
    }
}
