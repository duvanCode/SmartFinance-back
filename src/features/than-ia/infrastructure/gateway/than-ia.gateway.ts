import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ProcessTextInputUseCase } from '../../application/use-cases/process-text-input.use-case';
import { ProcessAudioInputUseCase } from '../../application/use-cases/process-audio-input.use-case';
import { SpeakDirectlyUseCase } from '../../application/use-cases/speak-directly.use-case';
import { SocketioVoiceConnector } from '../connectors/voice-transport/socketio-voice.connector';
import { PageContextDto } from '../../application/dtos/page-context.dto';
import { ThanIaWsGuard } from '../guards/than-ia-ws.guard';

@WebSocketGateway({ namespace: '/than-ia', cors: { origin: '*' } })
export class ThanIaGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ThanIaGateway.name);

  constructor(
    private readonly processText: ProcessTextInputUseCase,
    private readonly processAudio: ProcessAudioInputUseCase,
    private readonly speakDirectly: SpeakDirectlyUseCase,
    private readonly transport: SocketioVoiceConnector,
  ) {}

  afterInit(server: Server): void {
    // Wire the socket.io server to the transport connector
    this.transport.setServer(server);
    this.logger.log('than-IA WebSocket Gateway initialized on /than-ia');
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.processText.clearSession(client.id);
    this.processAudio.clearSession(client.id);
  }

  /** Frontend sends current page + form state before/during a turn */
  @SubscribeMessage('page_context')
  handlePageContext(
    @MessageBody() ctx: PageContextDto,
    @ConnectedSocket() client: Socket,
  ): void {
    this.processText.updatePageContext(client.id, ctx);
  }

  /** Text message from the chat panel */
  @UseGuards(ThanIaWsGuard)
  @SubscribeMessage('text_input')
  async handleTextInput(
    @MessageBody() data: { text: string; pageContext?: PageContextDto },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId: string = client.data!['userId'];
    await this.processText.execute(
      {
        text: data.text,
        pageContext: data.pageContext ?? { currentPage: 'home' },
      },
      client.id,
      userId,
    );
  }

  /** Raw audio chunk from the microphone (binary or base64) */
  @UseGuards(ThanIaWsGuard)
  @SubscribeMessage('audio_chunk')
  handleAudioChunk(
    @MessageBody() data: { chunk: string } | Buffer,
    @ConnectedSocket() client: Socket,
  ): void {
    const chunk: Buffer = Buffer.isBuffer(data)
      ? data
      : Buffer.from((data as { chunk: string }).chunk, 'base64');
    this.processAudio.appendChunk(client.id, chunk);
  }

  /** Signals end of audio recording — triggers STT + LLM pipeline */
  @UseGuards(ThanIaWsGuard)
  @SubscribeMessage('audio_end')
  async handleAudioEnd(
    @MessageBody() data: { pageContext?: PageContextDto },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId: string = client.data!['userId'];
    await this.processAudio.finalizeAndProcess(
      client.id,
      userId,
      data.pageContext ?? { currentPage: 'home' },
    );
  }
  /** Agent-initiated speech: skip LLM, go straight to TTS */
  @UseGuards(ThanIaWsGuard)
  @SubscribeMessage('agent_speak')
  async handleAgentSpeak(
    @MessageBody() data: { text: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    await this.speakDirectly.execute(client.id, data.text);
  }
}
