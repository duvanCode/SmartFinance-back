import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { BaseUseCase } from '@shared/application/base.use-case';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import {
  ITokenGenerator,
  TOKEN_GENERATOR,
} from '../ports/token-generator.interface';
import { User } from '../../domain/entities/user.entity';

export interface ValidateTokenInput {
  token: string;
}

export interface ValidateTokenOutput {
  user: User;
}

@Injectable()
export class ValidateTokenUseCase
  implements BaseUseCase<ValidateTokenInput, ValidateTokenOutput>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(TOKEN_GENERATOR)
    private readonly tokenGenerator: ITokenGenerator,
  ) {}

  async execute(input: ValidateTokenInput): Promise<ValidateTokenOutput> {
    try {
      // 1. Verificar y decodificar JWT
      const payload = this.tokenGenerator.verify(input.token);

      // 2. Buscar usuario por ID del payload
      const user = await this.userRepository.findById(payload.userId);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // 3. Retornar usuario
      return { user };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
