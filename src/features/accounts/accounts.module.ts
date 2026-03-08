import { Module } from '@nestjs/common';
import { AccountsController } from './infrastructure/http/controllers/accounts.controller';
import { CreateAccountUseCase } from './application/use-cases/create-account.use-case';
import { GetAccountsByUserIdUseCase } from './application/use-cases/get-accounts-by-user-id.use-case';
import { GetAccountByIdUseCase } from './application/use-cases/get-account-by-id.use-case';
import { UpdateAccountUseCase } from './application/use-cases/update-account.use-case';
import { InactivateAccountUseCase } from './application/use-cases/inactivate-account.use-case';
import { AccountsMigrationService } from './infrastructure/services/accounts.migration.service';
import { AccountPrismaRepository } from './infrastructure/repositories/account-prisma.repository';
import { ACCOUNT_REPOSITORY } from './domain/repositories/account.repository.interface';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { AuthModule } from '@features/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AccountsController],
  providers: [
    {
      provide: ACCOUNT_REPOSITORY,
      useClass: AccountPrismaRepository,
    },
    CreateAccountUseCase,
    GetAccountsByUserIdUseCase,
    GetAccountByIdUseCase,
    UpdateAccountUseCase,
    InactivateAccountUseCase,
    AccountsMigrationService,
    PrismaService,
  ],
  exports: [
    ACCOUNT_REPOSITORY,
    CreateAccountUseCase,
    GetAccountsByUserIdUseCase,
    GetAccountByIdUseCase,
    UpdateAccountUseCase,
    InactivateAccountUseCase,
  ],
})
export class AccountsModule {}
