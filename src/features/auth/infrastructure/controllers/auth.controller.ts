import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { GoogleLoginUseCase } from '../../application/use-cases/google-login.use-case';
import { GoogleLoginDto } from '../../application/dto/login.dto';
import { AuthResponseDto, UserResponseDto } from '../../application/dto/auth-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from '../../domain/entities/user.entity';

interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly googleLoginUseCase: GoogleLoginUseCase) {}

  @Post('google/login')
  @ApiOperation({
    summary: 'Login with Google',
    description: 'Authenticate user using Google OAuth ID token. Creates a new user if it does not exist.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated. Returns JWT token and user data.',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body or missing token.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid Google token.',
  })
  async googleLogin(@Body() dto: GoogleLoginDto): Promise<AuthResponseDto> {
    return this.googleLoginUseCase.execute({ token: dto.token });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns the profile information of the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile data.',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing JWT token.',
  })
  async getProfile(@Request() req: RequestWithUser): Promise<UserResponseDto> {
    return {
      id: req.user.id,
      email: req.user.email.getValue(),
      name: req.user.name,
      avatar: req.user.avatar,
    };
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Check if the auth service is running.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
      },
    },
  })
  health(): { status: string } {
    return { status: 'ok' };
  }
}
