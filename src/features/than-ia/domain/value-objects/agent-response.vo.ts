export interface AgentResponseVO {
  /**
   * Text to be spoken by the TTS engine.
   * Extracted in real-time from the LLM stream.
   */
  speech: string;

  /**
   * Full chat text to display in the UI panel.
   * May include markdown.
   */
  chatText: string;

  /**
   * Parsed agent action, if the LLM decided to execute one.
   */
  action?: {
    type: string;
    payload: Record<string, unknown>;
    jsCode?: string;
  };
}
