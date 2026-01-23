import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ITokenGenerator,
  TokenPayload,
} from '../../application/ports/token-generator.interface';

@Injectable()
export class JwtTokenService implements ITokenGenerator {
  constructor(private jwtService: JwtService) {}

  generate(payload: TokenPayload): string {
    return this.jwtService.sign(payload);
  }

  verify(token: string): TokenPayload {
    return this.jwtService.verify(token);
  }
}
