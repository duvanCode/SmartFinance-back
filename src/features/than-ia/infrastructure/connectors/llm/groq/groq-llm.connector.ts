import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import {
  ILLMRepository,
  ChatMessage,
  LLMConfig,
} from '../../../../domain/repositories/llm.repository.interface';

@Injectable()
export class GroqLLMConnector implements ILLMRepository {
  private readonly logger = new Logger(GroqLLMConnector.name);
  private readonly client: Groq;
  private readonly defaultModel: string;

  constructor(private readonly config: ConfigService) {
    this.client = new Groq({
      apiKey: this.config.get<string>('GROQ_API_KEY', ''),
    });
    this.defaultModel = this.config.get<string>(
      'GROQ_MODEL',
      'llama-3.1-8b-instant',
    );
  }

  async *streamCompletion(
    messages: ChatMessage[],
    cfg: LLMConfig,
  ): AsyncIterable<string> {
    const stream = await this.client.chat.completions.create({
      messages: messages as Groq.Chat.ChatCompletionMessageParam[],
      model: cfg.model ?? this.defaultModel,
      temperature: cfg.temperature ?? 0.6,
      max_tokens: cfg.maxTokens ?? 1024,
      stream: true,
      response_format: { type: 'json_object' },
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        yield delta;
      }
    }
  }
}
