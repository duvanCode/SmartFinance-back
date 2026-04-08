import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ILLMRepository,
  LLM_REPOSITORY,
  ChatMessage,
} from '../../domain/repositories/llm.repository.interface';
import {
  ITTSRepository,
  TTS_REPOSITORY,
  VoiceConfig,
} from '../../domain/repositories/tts.repository.interface';
import {
  IVoiceTransportRepository,
  VOICE_TRANSPORT_REPOSITORY,
} from '../../domain/repositories/voice-transport.repository.interface';
import {
  IActionRegistryRepository,
  ACTION_REGISTRY_REPOSITORY,
} from '../../domain/repositories/action-registry.repository.interface';
import { AgentContextBuilderService } from '../services/agent-context-builder.service';
import { TextInputDto } from '../dtos/text-input.dto';
import { PageContextDto } from '../dtos/page-context.dto';

const DEFAULT_VOICE: VoiceConfig = {
  language: 'es-419',
};

const LLM_CONFIG = {
  model: 'llama-3.1-8b-instant',
  temperature: 0.6,
  maxTokens: 1024,
};

interface SessionState {
  history: ChatMessage[];
  pageContext: PageContextDto;
}

@Injectable()
export class ProcessTextInputUseCase {
  private readonly logger = new Logger(ProcessTextInputUseCase.name);
  private readonly sessions = new Map<string, SessionState>();

  constructor(
    @Inject(LLM_REPOSITORY) private readonly llm: ILLMRepository,
    @Inject(TTS_REPOSITORY) private readonly tts: ITTSRepository,
    @Inject(VOICE_TRANSPORT_REPOSITORY)
    private readonly transport: IVoiceTransportRepository,
    @Inject(ACTION_REGISTRY_REPOSITORY)
    private readonly registry: IActionRegistryRepository,
    private readonly contextBuilder: AgentContextBuilderService,
  ) {}

  updatePageContext(sessionId: string, ctx: PageContextDto): void {
    const state = this.getOrCreateSession(sessionId);
    state.pageContext = ctx;
  }

  async execute(dto: TextInputDto, sessionId: string, userId: string): Promise<void> {
    const state = this.getOrCreateSession(sessionId);

    if (dto.pageContext) {
      state.pageContext = dto.pageContext;
    }

    // Add user message to history
    state.history.push({ role: 'user', content: dto.text });

    const availableActions = this.registry.getAvailableActions(
      state.pageContext.currentPage,
    );

    const messages = this.contextBuilder.buildSystemPrompt(
      state.pageContext,
      availableActions,
      state.history,
    );

    let fullContent = '';
    const textChunks: string[] = [];

    // Stream LLM response
    try {
      for await (const delta of this.llm.streamCompletion(messages, LLM_CONFIG)) {
        fullContent += delta;
      }
    } catch (err) {
      this.logger.error('LLM stream error', err);
      this.transport.sendError(sessionId, 'Error al generar respuesta del agente.');
      return;
    }

    // Add assistant response to history (keep last 10 turns to manage context window)
    state.history.push({ role: 'assistant', content: fullContent });
    if (state.history.length > 20) {
      state.history = state.history.slice(state.history.length - 20);
    }

    // Parse the full JSON response
    let parsed: { speech?: string; chatText?: string; action?: { type: string; payload: Record<string, unknown>; jsCode?: string } } = {};
    try {
      parsed = JSON.parse(fullContent);
    } catch (err) {
      try {
        const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON match found');
        }
      } catch (innerErr) {
        this.logger.warn('Failed to parse LLM JSON response, treating as plain text');
        parsed = { speech: fullContent, chatText: fullContent };
      }
    }

    // Never fallback to fullContent if it's JSON but missing text fields
    const fallbackMessage = parsed.action ? 'Entendido. Ejecutando la acción...' : 'Lo siento, no pude procesar la respuesta adecuadamente.';
    const speechText = parsed.speech || parsed.chatText || fallbackMessage;
    const terminalChatText = parsed.chatText || parsed.speech || fallbackMessage;

    // Send the clean chat text to the frontend (triggers typewriter effect)
    this.transport.sendTextChunk(sessionId, terminalChatText);

    // Execute action if present
    if (parsed.action?.type) {
      try {
        const payloadProvided = parsed.action.payload ?? {};
        // If the LLM omitted 'payload' wrapper and put fields directly on the action object
        const actionKeys = Object.keys(parsed.action).filter(k => k !== 'type' && k !== 'payload' && k !== 'jsCode');
        const reconstructedPayload = Object.keys(payloadProvided).length === 0 && actionKeys.length > 0
            ? actionKeys.reduce((acc, key) => ({ ...acc, [key]: (parsed as any).action[key] }), {})
            : payloadProvided;

        const result = await this.registry.execute(
          parsed.action.type,
          reconstructedPayload,
          userId,
        );
        this.transport.sendAction(sessionId, {
          type: parsed.action.type,
          payload: reconstructedPayload,
          jsCode: result.jsCode ?? parsed.action.jsCode,
        });
      } catch (err) {
        this.logger.error(`Action ${parsed.action.type} failed`, err);
      }
    }

    // Stream speech through TTS
    if (speechText.trim()) {
      try {
        for await (const chunk of this.tts.synthesize(speechText, DEFAULT_VOICE)) {
          this.transport.sendAudioChunk(sessionId, chunk);
        }
      } catch (err) {
        this.logger.error('TTS error', err);
      }
    }

    this.transport.sendTurnEnd(sessionId);
  }

  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  private getOrCreateSession(sessionId: string): SessionState {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        history: [],
        pageContext: { currentPage: 'home' },
      });
    }
    return this.sessions.get(sessionId)!;
  }
}
