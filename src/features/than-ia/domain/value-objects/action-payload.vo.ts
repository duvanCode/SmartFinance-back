/**
 * Value Object for an agent action payload.
 * This is only validated; the userId is NEVER part of an action payload —
 * it always comes from the authenticated session.
 */
export interface ActionPayloadVO {
  /** Unique identifier for the action type (e.g. 'FILL_ACCOUNT_FIELD') */
  actionType: string;

  /** Arbitrary data the LLM provides for the action handler */
  data: Record<string, unknown>;
}
