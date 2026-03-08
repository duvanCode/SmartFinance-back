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

export interface DeleteLoanInput {
    userId: string;
    id: string;
}

@Injectable()
export class DeleteLoanUseCase
    implements BaseUseCase<DeleteLoanInput, { success: boolean }> {
    constructor(
        @Inject(LOAN_REPOSITORY)
        private readonly loanRepository: ILoanRepository,
    ) { }

    async execute(input: DeleteLoanInput): Promise<{ success: boolean }> {
        const loan = await this.loanRepository.findById(input.id);
        
        if (!loan || loan.userId !== input.userId) {
            throw new NotFoundException('Loan not found');
        }

        await this.loanRepository.deleteTransactionsByLoanId(input.id, input.userId);
        await this.loanRepository.delete(input.id);

        return { success: true };
    }
}
