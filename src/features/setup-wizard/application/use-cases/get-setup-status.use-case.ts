import { Inject, Injectable } from '@nestjs/common';
import { IWizardRepository, WIZARD_REPOSITORY } from '../../domain/repositories/wizard-repository.interface';
import { SetupStatusDto } from '../dto/setup-status.dto';

@Injectable()
export class GetSetupStatusUseCase {
  constructor(
    @Inject(WIZARD_REPOSITORY)
    private readonly wizardRepository: IWizardRepository,
  ) {}

  async execute(userId: string): Promise<SetupStatusDto> {
    const setupCompleted = await this.wizardRepository.isSetupCompleted(userId);
    return { setupCompleted };
  }
}
