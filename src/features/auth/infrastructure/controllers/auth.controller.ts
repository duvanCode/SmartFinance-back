import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GoogleLoginUseCase } from '../../application/use-cases/google-login.use-case';
import { GoogleLoginDto } from '../../application/dto/login.dto';
import { AuthResponseDto } from '../../application/dto/auth-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from '../../domain/entities/user.entity';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly googleLoginUseCase: GoogleLoginUseCase) {}

  @Post('google/login')
  async googleLogin(@Body() dto: GoogleLoginDto): Promise<AuthResponseDto> {
    return this.googleLoginUseCase.execute({ token: dto.token });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: RequestWithUser) {
    return {
      id: req.user.id,
      email: req.user.email.getValue(),
      name: req.user.name,
      avatar: req.user.avatar,
    };
  }

  @Get('health')
  health(): { status: string } {
    return { status: 'ok' };
  }
}
