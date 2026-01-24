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
import { CategorizeTransactionUseCase } from './application/use-cases/categorize-transaction.use-case';

// Repositories
import { TransactionPrismaRepository } from './infrastructure/repositories/transaction-prisma.repository';
import { TRANSACTION_REPOSITORY } from './domain/repositories/transaction.repository.interface';

// Import AuthModule to use JwtAuthGuard
import { AuthModule } from '@features/auth/auth.module';

// Import CategoriesModule to access CATEGORY_REPOSITORY
import { CategoriesModule } from '@features/categories/categories.module';

// AI Integration
import { AI_CATEGORIZER } from './domain/interfaces/ai-categorizer.interface';
import { AnthropicCategorizerAdapter } from './infrastructure/ai-adapters/anthropic.adapter';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [AuthModule, CategoriesModule, ConfigModule],
  controllers: [TransactionsController],
  providers: [
    // Use Cases
    CreateTransactionUseCase,
    GetTransactionsUseCase,
    GetTransactionByIdUseCase,
    UpdateTransactionUseCase,
    DeleteTransactionUseCase,
    GetTransactionStatsUseCase,
    CategorizeTransactionUseCase,

    // Repositories
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: TransactionPrismaRepository,
    },

    // AI Adapter Provider (can be switched easily)
    {
      provide: AI_CATEGORIZER,
      useClass: AnthropicCategorizerAdapter,
    },
  ],
  exports: [TRANSACTION_REPOSITORY],
})
export class TransactionsModule { }
