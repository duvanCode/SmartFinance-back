import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@features/auth/auth.module';
import { TransactionsModule } from '@features/transactions/transactions.module';

// Domain tokens
import { LLM_REPOSITORY } from './domain/repositories/llm.repository.interface';
import { TTS_REPOSITORY } from './domain/repositories/tts.repository.interface';
import { STT_REPOSITORY } from './domain/repositories/stt.repository.interface';
import { VOICE_TRANSPORT_REPOSITORY } from './domain/repositories/voice-transport.repository.interface';
import { ACTION_REGISTRY_REPOSITORY } from './domain/repositories/action-registry.repository.interface';

// Connectors (concrete implementations)
import { GroqLLMConnector } from './infrastructure/connectors/llm/groq/groq-llm.connector';
import { DeepgramTTSConnector } from './infrastructure/connectors/tts/deepgram/deepgram-tts.connector';
import { GroqSTTConnector } from './infrastructure/connectors/stt/groq/groq-stt.connector';
import { SocketioVoiceConnector } from './infrastructure/connectors/voice-transport/socketio-voice.connector';

// Action Registry
import { ActionRegistryService, AGENT_ACTION_HANDLERS } from './infrastructure/actions/registry/action-registry.service';

// Action Handlers
import { FillAccountFieldAction } from './infrastructure/actions/wizard/fill-account-field.action';
import { SubmitWizardStepAction } from './infrastructure/actions/wizard/submit-wizard-step.action';
import { CreateTransactionAction } from './infrastructure/actions/transactions/create-transaction.action';

// Application Layer
import { AgentContextBuilderService } from './application/services/agent-context-builder.service';
import { ProcessTextInputUseCase } from './application/use-cases/process-text-input.use-case';
import { ProcessAudioInputUseCase } from './application/use-cases/process-audio-input.use-case';
import { ExecuteAgentActionUseCase } from './application/use-cases/execute-agent-action.use-case';
import { SpeakDirectlyUseCase } from './application/use-cases/speak-directly.use-case';

// Infrastructure — Gateway & Guard
import { ThanIaGateway } from './infrastructure/gateway/than-ia.gateway';
import { ThanIaWsGuard } from './infrastructure/guards/than-ia-ws.guard';

// For transactions action
import { CreateTransactionUseCase } from '@features/transactions/application/use-cases/create-transaction.use-case';
import { AccountsModule } from '@features/accounts/accounts.module';
import { CategoriesModule } from '@features/categories/categories.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    TransactionsModule,
    AccountsModule,
    CategoriesModule,
  ],
  providers: [
    // ─── Connectors (Port implementations) ───────────────────────────────────
    {
      provide: LLM_REPOSITORY,
      useClass: GroqLLMConnector,
    },
    {
      provide: TTS_REPOSITORY,
      useClass: DeepgramTTSConnector,
    },
    {
      provide: STT_REPOSITORY,
      useClass: GroqSTTConnector,
    },
    SocketioVoiceConnector, // also bound as concrete class (gateway needs it)
    {
      provide: VOICE_TRANSPORT_REPOSITORY,
      useExisting: SocketioVoiceConnector,
    },

    // ─── Action Registry ─────────────────────────────────────────────────────
    ActionRegistryService,
    {
      provide: ACTION_REGISTRY_REPOSITORY,
      useExisting: ActionRegistryService,
    },

    // ─── Action Handlers ─────────────────────────────────────────────────────
    FillAccountFieldAction,
    SubmitWizardStepAction,
    CreateTransactionAction,
    {
      provide: AGENT_ACTION_HANDLERS,
      useFactory: (
        fill: FillAccountFieldAction,
        submit: SubmitWizardStepAction,
        create: CreateTransactionAction,
      ) => [fill, submit, create],
      inject: [FillAccountFieldAction, SubmitWizardStepAction, CreateTransactionAction],
    },

    // ─── Application Services & Use Cases ────────────────────────────────────
    AgentContextBuilderService,
    ProcessTextInputUseCase,
    ProcessAudioInputUseCase,
    ExecuteAgentActionUseCase,
    SpeakDirectlyUseCase,

    // ─── Gateway & Guard ─────────────────────────────────────────────────────
    ThanIaGateway,
    ThanIaWsGuard,
  ],
  exports: [
    ProcessTextInputUseCase,
    ProcessAudioInputUseCase,
    ExecuteAgentActionUseCase,
    SpeakDirectlyUseCase,
    ThanIaGateway,
  ],
})
export class ThanIaModule {}
