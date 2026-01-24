import { Module } from '@nestjs/common';

// Controllers
import { TransactionsController } from './infrastructure/controllers/transactions.controller';

// Use Cases
import { CreateTransactionUseCase } from './application/use-cases/create-transaction.use-case';
import { GetTransactionsUseCase } from './application/use-cases/get-transactions.use-case';
import { GetTransactionByIdUseCase } from './application/use-cases/get-transaction-by-id.use-case';
import { UpdateTransactionUseCase } from './application/use-cases/update-transaction.use-case';
import { DeleteTransactionUseCase } from './application/use-cases/delete-transaction.use-case';
import { GetTransactionStatsUseCase } from './application/use-cases/get-transaction-stats.use-case';

// Repositories
import { TransactionPrismaRepository } from './infrastructure/repositories/transaction-prisma.repository';
import { TRANSACTION_REPOSITORY } from './domain/repositories/transaction.repository.interface';

// Import AuthModule to use JwtAuthGuard
import { AuthModule } from '@features/auth/auth.module';

// Import CategoriesModule to access CATEGORY_REPOSITORY
import { CategoriesModule } from '@features/categories/categories.module';

@Module({
  imports: [AuthModule, CategoriesModule],
  controllers: [TransactionsController],
  providers: [
    // Use Cases
    CreateTransactionUseCase,
    GetTransactionsUseCase,
    GetTransactionByIdUseCase,
    UpdateTransactionUseCase,
    DeleteTransactionUseCase,
    GetTransactionStatsUseCase,

    // Repositories
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: TransactionPrismaRepository,
    },
  ],
  exports: [TRANSACTION_REPOSITORY],
})
export class TransactionsModule {}
