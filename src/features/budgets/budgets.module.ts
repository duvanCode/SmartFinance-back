import { Module } from '@nestjs/common';
import { AuthModule } from '@features/auth/auth.module';
import { CategoriesModule } from '@features/categories/categories.module';
import { TransactionsModule } from '@features/transactions/transactions.module';

// Controllers
import { BudgetsController } from './infrastructure/controllers/budgets.controller';

// Use Cases
import { CreateBudgetUseCase } from './application/use-cases/create-budget.use-case';
import { GetBudgetsUseCase } from './application/use-cases/get-budgets.use-case';
import { GetBudgetByIdUseCase } from './application/use-cases/get-budget-by-id.use-case';
import { GetBudgetStatusUseCase } from './application/use-cases/get-budget-status.use-case';
import { UpdateBudgetUseCase } from './application/use-cases/update-budget.use-case';
import { DeleteBudgetUseCase } from './application/use-cases/delete-budget.use-case';

// Services
import { BudgetAnalyzerService } from './infrastructure/services/budget-analyzer.service';

// Repositories
import { BudgetPrismaRepository } from './infrastructure/repositories/budget-prisma.repository';
import { BUDGET_REPOSITORY } from './domain/repositories/budget.repository.interface';

@Module({
    imports: [AuthModule, CategoriesModule, TransactionsModule],
    controllers: [BudgetsController],
    providers: [
        // Use Cases
        CreateBudgetUseCase,
        GetBudgetsUseCase,
        GetBudgetByIdUseCase,
        GetBudgetStatusUseCase,
        UpdateBudgetUseCase,
        DeleteBudgetUseCase,

        // Services
        BudgetAnalyzerService,

        // Repositories
        {
            provide: BUDGET_REPOSITORY,
            useClass: BudgetPrismaRepository,
        },
    ],
    exports: [BUDGET_REPOSITORY],
})
export class BudgetsModule { }
