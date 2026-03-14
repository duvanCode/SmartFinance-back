import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/infrastructure/guards/jwt-auth.guard';
import { GetSetupStatusUseCase } from '../../application/use-cases/get-setup-status.use-case';
import { CompleteSetupUseCase } from '../../application/use-cases/complete-setup.use-case';
import { CompleteSetupDto } from '../../application/dto/complete-setup.dto';
import { SetupStatusDto } from '../../application/dto/setup-status.dto';

interface RequestWithUser extends Request {
  user: { userId: string; email: string };
}

@ApiTags('Setup Wizard')
@ApiBearerAuth('JWT-auth')
@Controller('setup-wizard')
@UseGuards(JwtAuthGuard)
export class SetupWizardController {
  constructor(
    private readonly getSetupStatusUseCase: GetSetupStatusUseCase,
    private readonly completeSetupUseCase: CompleteSetupUseCase,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Get setup wizard completion status for the current user' })
  @ApiResponse({ status: 200, type: SetupStatusDto })
  async getStatus(@Request() req: RequestWithUser): Promise<SetupStatusDto> {
    return this.getSetupStatusUseCase.execute(req.user.userId);
  }

  @Post('complete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Complete the initial setup wizard (creates accounts, marks setup done)' })
  @ApiResponse({ status: 204, description: 'Setup completed successfully' })
  @ApiResponse({ status: 400, description: 'Already completed or validation error' })
  async complete(
    @Request() req: RequestWithUser,
    @Body() dto: CompleteSetupDto,
  ): Promise<void> {
    await this.completeSetupUseCase.execute(req.user.userId, dto);
  }
}
