import 'reflect-metadata';

export const AGENT_ACTION_METADATA = 'than_ia:agent_action';

export interface AgentActionMeta {
  /** Unique action identifier, e.g. 'FILL_ACCOUNT_FIELD' */
  type: string;

  /**
   * Pages where this action is available.
   * Use wildcard '*' to make it globally available.
   * Examples: ['wizard/accounts'], ['transactions'], ['*']
   */
  pages: string[];

  /** Natural language description sent to the LLM so it knows what the action does */
  description: string;

  /**
   * JSON Schema of the payload the LLM must provide.
   * Used for validation and for the LLM prompt.
   */
  schema: Record<string, unknown>;
}

/**
 * Decorator to register a class as an agent action handler.
 * The ActionRegistryService will discover all classes decorated with this.
 *
 * @example
 * @AgentAction({
 *   type: 'FILL_ACCOUNT_FIELD',
 *   pages: ['wizard/accounts'],
 *   description: 'Fills a field in the account wizard form',
 *   schema: { field: 'string', value: 'string' },
 * })
 * export class FillAccountFieldAction implements AgentActionHandler { ... }
 */
export function AgentAction(meta: AgentActionMeta): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(AGENT_ACTION_METADATA, meta, target);
  };
}

/** Interface that all action handler classes must implement */
export interface AgentActionHandler {
  handle(
    payload: Record<string, unknown>,
    userId: string,
  ): Promise<{ success: boolean; message?: string; jsCode?: string; data?: unknown }>;
}
