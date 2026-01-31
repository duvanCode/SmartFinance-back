import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';
import { HealthModule } from './shared/infrastructure/health/health.module';
import { AuthModule } from './features/auth/auth.module';
import { CategoriesModule } from './features/categories/categories.module';
import { TransactionsModule } from './features/transactions/transactions.module';
import { BudgetsModule } from './features/budgets/budgets.module';
import { AnalyticsModule } from './features/analytics/analytics.module';
import { LoansModule } from './features/loans/loans.module';
import appConfig from './shared/infrastructure/config/app.config';
import databaseConfig from './shared/infrastructure/config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting configuration
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ([
        {
          ttl: config.get<number>('THROTTLE_TTL', 60000), // 60 seconds
          limit: config.get<number>('THROTTLE_LIMIT', 100), // 100 requests per minute
        },
      ]),
    }),

    PrismaModule,
    HealthModule,
    AuthModule,
    CategoriesModule,
    TransactionsModule,
    BudgetsModule,
    AnalyticsModule,
    LoansModule,
  ],
  controllers: [],
  providers: [
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
