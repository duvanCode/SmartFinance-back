import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IActionRegistryRepository,
  ACTION_REGISTRY_REPOSITORY,
  ActionResult,
} from '../../domain/repositories/action-registry.repository.interface';

@Injectable()
export class ExecuteAgentActionUseCase {
  private readonly logger = new Logger(ExecuteAgentActionUseCase.name);

  constructor(
    @Inject(ACTION_REGISTRY_REPOSITORY)
    private readonly registry: IActionRegistryRepository,
  ) {}

  async execute(
    actionType: string,
    payload: Record<string, unknown>,
    userId: string,
  ): Promise<ActionResult> {
    this.logger.log(`Executing action ${actionType} for user ${userId}`);
    return this.registry.execute(actionType, payload, userId);
  }
}
