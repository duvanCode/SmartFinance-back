import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { IVoiceTransportRepository } from '../../../domain/repositories/voice-transport.repository.interface';

@Injectable()
export class SocketioVoiceConnector implements IVoiceTransportRepository {
  private server: Server | null = null;

  /** Called by the gateway after the WS server is initialized */
  setServer(server: Server): void {
    this.server = server;
  }

  sendAudioChunk(sessionId: string, chunk: Buffer): void {
    this.server
      ?.to(sessionId)
      .emit('audio_chunk', { data: chunk.toString('base64') });
  }

  sendTextChunk(sessionId: string, text: string): void {
    this.server?.to(sessionId).emit('text_chunk', { text });
  }

  sendAction(
    sessionId: string,
    action: { type: string; payload?: Record<string, unknown>; jsCode?: string },
  ): void {
    this.server?.to(sessionId).emit('action', action);
  }

  sendTranscriptChunk(sessionId: string, text: string, isFinal: boolean): void {
    this.server?.to(sessionId).emit('transcript_chunk', { text, isFinal });
  }

  sendTurnEnd(sessionId: string): void {
    this.server?.to(sessionId).emit('turn_end', { status: 'done' });
  }

  sendError(sessionId: string, message: string): void {
    this.server?.to(sessionId).emit('error', { message });
  }
}
