import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaModule } from '@shared/infrastructure/prisma/prisma.module';
import { WizardPrismaRepository } from './infrastructure/repositories/wizard-prisma.repository';
import { WIZARD_REPOSITORY } from './domain/repositories/wizard-repository.interface';
import { GetSetupStatusUseCase } from './application/use-cases/get-setup-status.use-case';
import { CompleteSetupUseCase } from './application/use-cases/complete-setup.use-case';
import { SetupWizardController } from './infrastructure/controllers/setup-wizard.controller';

// NOTE: WizardGateway and WizardAiProxyService have been removed.
// The assistant for the wizard is now handled by than-ia module (ThanIaGateway on /than-ia).

@Module({
  imports: [PrismaModule, CacheModule.register()],
  controllers: [SetupWizardController],
  providers: [
    {
      provide: WIZARD_REPOSITORY,
      useClass: WizardPrismaRepository,
    },
    GetSetupStatusUseCase,
    CompleteSetupUseCase,
  ],
  exports: [
    CompleteSetupUseCase,
    WIZARD_REPOSITORY,
  ],
})
export class SetupWizardModule {}
