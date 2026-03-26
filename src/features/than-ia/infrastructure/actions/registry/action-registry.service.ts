import { Inject, Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import {
  IActionRegistryRepository,
  ActionDescriptor,
  ActionResult,
} from '../../../domain/repositories/action-registry.repository.interface';
import {
  AGENT_ACTION_METADATA,
  AgentActionMeta,
  AgentActionHandler,
} from '../decorators/agent-action.decorator';

export const AGENT_ACTION_HANDLERS = Symbol('AGENT_ACTION_HANDLERS');

interface RegistryEntry {
  meta: AgentActionMeta;
  handler: AgentActionHandler;
}

@Injectable()
export class ActionRegistryService
  implements IActionRegistryRepository, OnModuleInit
{
  private readonly logger = new Logger(ActionRegistryService.name);
  private readonly registry = new Map<string, RegistryEntry>();

  constructor(
    @Optional()
    @Inject(AGENT_ACTION_HANDLERS)
    private readonly handlers: AgentActionHandler[] = [],
  ) {}

  onModuleInit(): void {
    this.discoverActions();
  }

  private discoverActions(): void {
    for (const handler of this.handlers) {
      const meta: AgentActionMeta | undefined = Reflect.getMetadata(
        AGENT_ACTION_METADATA,
        handler.constructor,
      );

      if (meta) {
        this.registry.set(meta.type, { meta, handler });
        this.logger.log(
          `Registered action: ${meta.type} (pages: ${meta.pages.join(', ')})`,
        );
      } else {
        this.logger.warn(
          `Handler ${handler.constructor.name} has no @AgentAction metadata`,
        );
      }
    }

    this.logger.log(
      `Action registry initialized with ${this.registry.size} action(s)`,
    );
  }

  getAvailableActions(page: string): ActionDescriptor[] {
    const descriptors: ActionDescriptor[] = [];
    for (const [, entry] of this.registry) {
      const { meta } = entry;
      if (meta.pages.includes('*') || meta.pages.includes(page)) {
        descriptors.push({
          type: meta.type,
          pages: meta.pages,
          description: meta.description,
          schema: meta.schema,
        });
      }
    }
    return descriptors;
  }

  async execute(
    actionType: string,
    payload: Record<string, unknown>,
    userId: string,
  ): Promise<ActionResult> {
    const entry = this.registry.get(actionType);
    if (!entry) {
      this.logger.warn(`Unknown action type: ${actionType}`);
      return { success: false, message: `Unknown action: ${actionType}` };
    }

    try {
      return await entry.handler.handle(payload, userId);
    } catch (err) {
      this.logger.error(`Action ${actionType} threw an error`, err);
      return { success: false, message: `Action failed: ${String(err)}` };
    }
  }

  /** Register a handler programmatically (useful for testing) */
  registerAction(meta: AgentActionMeta, handler: AgentActionHandler): void {
    this.registry.set(meta.type, { meta, handler });
    this.logger.log(`Manually registered action: ${meta.type}`);
  }
}
