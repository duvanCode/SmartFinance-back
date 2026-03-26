import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class ThanIaWsGuard implements CanActivate {
  private readonly logger = new Logger(ThanIaWsGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();

    // Extract token from handshake auth or query
    const token =
      (client.handshake.auth as Record<string, string>)?.token ??
      (client.handshake.query as Record<string, string>)?.token;

    if (!token) {
      this.logger.warn(`WS connection rejected: no token (${client.id})`);
      throw new WsException('Unauthorized: missing token');
    }

    try {
      const payload = this.jwtService.verify<{ sub: string; email: string }>(
        token,
        { secret: this.config.get<string>('JWT_SECRET') },
      );

      // Inject userId into client data so gateway can use it safely
      client.data!['userId'] = payload.sub;
      client.data!['email'] = payload.email;

      return true;
    } catch {
      this.logger.warn(`WS connection rejected: invalid token (${client.id})`);
      throw new WsException('Unauthorized: invalid token');
    }
  }
}
