import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Controllers
import { AuthController } from './infrastructure/controllers/auth.controller';

// Use Cases
import { GoogleLoginUseCase } from './application/use-cases/google-login.use-case';
import { ValidateTokenUseCase } from './application/use-cases/validate-token.use-case';

// Repositories
import { UserPrismaRepository } from './infrastructure/repositories/user-prisma.repository';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';

// Services
import { GoogleOAuthService } from './infrastructure/services/google-oauth.service';
import { OAUTH_PROVIDER } from './application/ports/oauth-provider.interface';
import { JwtTokenService } from './infrastructure/services/jwt-token.service';
import { TOKEN_GENERATOR } from './application/ports/token-generator.interface';

// Strategies
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const expiresIn = configService.get<string>('JWT_EXPIRATION') ?? '7d';
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: expiresIn as unknown as number,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Use Cases
    GoogleLoginUseCase,
    ValidateTokenUseCase,

    // Repositories
    {
      provide: USER_REPOSITORY,
      useClass: UserPrismaRepository,
    },

    // Services
    {
      provide: OAUTH_PROVIDER,
      useClass: GoogleOAuthService,
    },
    {
      provide: TOKEN_GENERATOR,
      useClass: JwtTokenService,
    },

    // Strategies
    JwtStrategy,
  ],
  exports: [ValidateTokenUseCase, USER_REPOSITORY],
})
export class AuthModule {}
