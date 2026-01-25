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
import { SPEECH_TO_TEXT } from './domain/interfaces/speech-to-text.interface';
import { AnthropicCategorizerAdapter } from './infrastructure/ai-adapters/anthropic.adapter';
import { VoskAdapter } from './infrastructure/ai-adapters/vosk.adapter';
import { ConfigModule } from '@nestjs/config';

// Logic Use Cases for AI
import { CreateTransactionFromTextUseCase } from './application/use-cases/create-transaction-from-text.use-case';
import { CreateTransactionFromAudioUseCase } from './application/use-cases/create-transaction-from-audio.use-case';

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
    CreateTransactionFromTextUseCase,
    CreateTransactionFromAudioUseCase,

    // Repositories
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: TransactionPrismaRepository,
    },

    // AI Adapter Provider
    {
      provide: AI_CATEGORIZER,
      useClass: AnthropicCategorizerAdapter,
    },

    // Speech to Text Adapter (Vosk - Offline)
    {
      provide: SPEECH_TO_TEXT,
      useClass: VoskAdapter,
    },
  ],
  exports: [TRANSACTION_REPOSITORY],
})
export class TransactionsModule { }
