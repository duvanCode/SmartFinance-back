export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export const LLM_REPOSITORY = Symbol('ILLMRepository');

export interface ILLMRepository {
  /**
   * Streams completion tokens from the LLM, yielding each text delta as it arrives.
   */
  streamCompletion(
    messages: ChatMessage[],
    config: LLMConfig,
  ): AsyncIterable<string>;
}
