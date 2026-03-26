export interface ActionDescriptor {
  type: string;
  pages: string[];
  description: string;
  schema: Record<string, unknown>;
}

export interface ActionResult {
  success: boolean;
  message?: string;
  jsCode?: string;
  data?: unknown;
}

export const ACTION_REGISTRY_REPOSITORY = Symbol('IActionRegistryRepository');

export interface IActionRegistryRepository {
  /**
   * Returns descriptors of actions available for the given page.
   * Use '*' to get globally available actions.
   */
  getAvailableActions(page: string): ActionDescriptor[];

  /**
   * Executes an action identified by its type.
   * userId is always taken from the authenticated session, never from the LLM payload.
   */
  execute(
    actionType: string,
    payload: Record<string, unknown>,
    userId: string,
  ): Promise<ActionResult>;
}
