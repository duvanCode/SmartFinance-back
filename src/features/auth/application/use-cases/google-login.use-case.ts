import { Inject, Injectable } from '@nestjs/common';
import { BaseUseCase } from '@shared/application/base.use-case';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import {
  IOAuthProvider,
  OAUTH_PROVIDER,
} from '../ports/oauth-provider.interface';
import {
  ITokenGenerator,
  TOKEN_GENERATOR,
} from '../ports/token-generator.interface';
import { User } from '../../domain/entities/user.entity';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { InitializeUserCategoriesUseCase } from '@features/categories/application/use-cases/initialize-user-categories.use-case';

export interface GoogleLoginInput {
  token: string;
}

@Injectable()
export class GoogleLoginUseCase
  implements BaseUseCase<GoogleLoginInput, AuthResponseDto> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(OAUTH_PROVIDER)
    private readonly oauthProvider: IOAuthProvider,
    @Inject(TOKEN_GENERATOR)
    private readonly tokenGenerator: ITokenGenerator,
    private readonly initializeUserCategoriesUseCase: InitializeUserCategoriesUseCase,
  ) { }

  async execute(input: GoogleLoginInput): Promise<AuthResponseDto> {
    // 1. Validar token de Google
    const googleUser = await this.oauthProvider.validateToken(input.token);

    // 2. Buscar usuario existente por Google ID
    let user = await this.userRepository.findByGoogleId(googleUser.id);

    // 3. Si no existe, crear nuevo usuario
    if (!user) {
      user = User.create(
        googleUser.email,
        googleUser.name,
        googleUser.id,
        googleUser.picture,
      );
      user = await this.userRepository.create(user);
      await this.initializeUserCategoriesUseCase.execute(user.id);
    }

    // 4. Generar JWT
    const accessToken = this.tokenGenerator.generate({
      userId: user.id,
      email: user.email.getValue(),
    });

    // 5. Retornar respuesta
    return new AuthResponseDto(accessToken, {
      id: user.id,
      email: user.email.getValue(),
      name: user.name,
      avatar: user.avatar,
    });
  }
}
