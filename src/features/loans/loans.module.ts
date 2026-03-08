import { Module } from '@nestjs/common';
import { LoansController } from './infrastructure/http/controllers/loans.controller';

// Use Cases
import { CreateLoanUseCase } from './application/use-cases/create-loan.use-case';
import { GetLoansUseCase } from './application/use-cases/get-loans.use-case';
import { GetLoanByIdUseCase } from './application/use-cases/get-loan-by-id.use-case';
import { UpdateLoanUseCase } from './application/use-cases/update-loan.use-case';
import { FinalizeLoanUseCase } from './application/use-cases/finalize-loan.use-case';
import { DeleteLoanUseCase } from './application/use-cases/delete-loan.use-case';

// Repositories
import { LOAN_REPOSITORY } from './domain/repositories/loan.repository.interface';
import { LoanPrismaRepository } from './infrastructure/repositories/loan-prisma.repository';

// Dependencies
import { AuthModule } from '../auth/auth.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
    imports: [AuthModule, CategoriesModule],
    controllers: [LoansController],
    providers: [
        // Use Cases
        CreateLoanUseCase,
        GetLoansUseCase,
        GetLoanByIdUseCase,
        UpdateLoanUseCase,
        FinalizeLoanUseCase,
        DeleteLoanUseCase,

        // Repositories
        {
            provide: LOAN_REPOSITORY,
            useClass: LoanPrismaRepository,
        },
    ],
    exports: [LOAN_REPOSITORY],
})
export class LoansModule { }
