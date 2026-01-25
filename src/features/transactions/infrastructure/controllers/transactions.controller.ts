import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateFromTextDto } from '../../application/dto/create-from-text.dto';
import { CreateTransactionFromTextUseCase } from '../../application/use-cases/create-transaction-from-text.use-case';
import { CreateTransactionFromAudioUseCase } from '../../application/use-cases/create-transaction-from-audio.use-case';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiQuery,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/infrastructure/guards/jwt-auth.guard';
import { CreateTransactionDto } from '../../application/dto/create-transaction.dto';
import { UpdateTransactionDto } from '../../application/dto/update-transaction.dto';
import { TransactionResponseDto } from '../../application/dto/transaction-response.dto';
import { TransactionStatsDto } from '../../application/dto/transaction-stats.dto';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction.use-case';
import { GetTransactionsUseCase } from '../../application/use-cases/get-transactions.use-case';
import { GetTransactionByIdUseCase } from '../../application/use-cases/get-transaction-by-id.use-case';
import { UpdateTransactionUseCase } from '../../application/use-cases/update-transaction.use-case';
import { DeleteTransactionUseCase } from '../../application/use-cases/delete-transaction.use-case';
import { GetTransactionStatsUseCase } from '../../application/use-cases/get-transaction-stats.use-case';
import { CategorizeTransactionUseCase } from '../../application/use-cases/categorize-transaction.use-case';
import { TransactionType } from '../../domain/enums/transaction-type.enum';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@ApiTags('Transactions')
@ApiBearerAuth('JWT-auth')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly getTransactionsUseCase: GetTransactionsUseCase,
    private readonly getTransactionByIdUseCase: GetTransactionByIdUseCase,
    private readonly updateTransactionUseCase: UpdateTransactionUseCase,
    private readonly deleteTransactionUseCase: DeleteTransactionUseCase,
    private readonly getTransactionStatsUseCase: GetTransactionStatsUseCase,
    private readonly categorizeTransactionUseCase: CategorizeTransactionUseCase,
    private readonly createTransactionFromTextUseCase: CreateTransactionFromTextUseCase,
    private readonly createTransactionFromAudioUseCase: CreateTransactionFromAudioUseCase,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new transaction',
    description: 'Create a new income or expense transaction.',
  })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully.',
    type: TransactionResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body, validation error, or category type mismatch.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing JWT token.',
  })
  @ApiNotFoundResponse({
    description: 'Category not found.',
  })
  async create(
    @Request() req: RequestWithUser,
    @Body() dto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return this.createTransactionUseCase.execute({
      userId: req.user.userId,
      categoryId: dto.categoryId,
      amount: dto.amount,
      type: dto.type,
      description: dto.description,
      date: dto.date,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Get all transactions',
    description: 'Retrieve all transactions for the authenticated user with optional filters.',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filter by category ID',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter transactions from this date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter transactions until this date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: TransactionType,
    description: 'Filter by transaction type',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records per page (default: 20)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of transactions.',
    type: [TransactionResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing JWT token.',
  })
  async findAll(
    @Request() req: RequestWithUser,
    @Query('categoryId') categoryId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<TransactionResponseDto[]> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const offset = (pageNum - 1) * limitNum;

    return this.getTransactionsUseCase.execute({
      userId: req.user.userId,
      categoryId,
      startDate,
      endDate,
      type: type ? (type.toUpperCase() as TransactionType) : undefined,
      limit: limitNum,
      offset,
    });
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get transaction statistics',
    description: 'Get income, expense, and balance statistics for a date range.',
  })
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: 'Start date for statistics (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description: 'End date for statistics (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction statistics.',
    type: TransactionStatsDto,
  })
  @ApiBadRequestResponse({
    description: 'Missing required date parameters.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing JWT token.',
  })
  async getStats(
    @Request() req: RequestWithUser,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<TransactionStatsDto> {
    return this.getTransactionStatsUseCase.execute({
      userId: req.user.userId,
      startDate,
      endDate,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a transaction by ID',
    description: 'Retrieve a specific transaction by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Transaction UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction details.',
    type: TransactionResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing JWT token.',
  })
  @ApiNotFoundResponse({
    description: 'Transaction not found.',
  })
  @ApiForbiddenResponse({
    description: 'Transaction does not belong to the user.',
  })
  async findOne(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<TransactionResponseDto> {
    return this.getTransactionByIdUseCase.execute({
      id,
      userId: req.user.userId,
    });
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a transaction',
    description: 'Update an existing transaction.',
  })
  @ApiParam({
    name: 'id',
    description: 'Transaction UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction updated successfully.',
    type: TransactionResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body or category type mismatch.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing JWT token.',
  })
  @ApiNotFoundResponse({
    description: 'Transaction or category not found.',
  })
  @ApiForbiddenResponse({
    description: 'Transaction does not belong to the user.',
  })
  async update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return this.updateTransactionUseCase.execute({
      id,
      userId: req.user.userId,
      categoryId: dto.categoryId,
      amount: dto.amount,
      description: dto.description,
      date: dto.date,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a transaction',
    description: 'Delete an existing transaction.',
  })
  @ApiParam({
    name: 'id',
    description: 'Transaction UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'Transaction deleted successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing JWT token.',
  })
  @ApiNotFoundResponse({
    description: 'Transaction not found.',
  })
  @ApiForbiddenResponse({
    description: 'Transaction does not belong to the user.',
  })
  async delete(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.deleteTransactionUseCase.execute({
      id,
      userId: req.user.userId,
    });
  }

  @Post('suggest-category')
  @ApiOperation({ summary: 'Suggest category for a transaction using AI' })
  @ApiResponse({ status: 200, description: 'Category suggestion' })
  async suggestCategory(
    @Request() req: RequestWithUser,
    @Body() body: { description: string; amount: number },
  ) {
    return this.categorizeTransactionUseCase.execute({
      userId: req.user.userId,
      description: body.description,
      amount: body.amount,
    });
  }

  @Post('from-text')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Extract transactions from natural language text',
    description: 'Parses a text (e.g., "Lunch 30 USD") and returns a preview of transaction data.',
  })
  @ApiResponse({ status: 200, description: 'Extracted transaction data' })
  async createFromText(
    @Request() req: RequestWithUser,
    @Body() dto: CreateFromTextDto,
  ) {
    return this.createTransactionFromTextUseCase.execute(req.user.userId, dto.text);
  }

  @Post('from-audio')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('audio', {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max
    },
    fileFilter: (_req, file, callback) => {
      const allowedMimeTypes = [
        'audio/mpeg',      // mp3
        'audio/mp3',       // mp3 alternative
        'audio/wav',       // wav
        'audio/wave',      // wav alternative
        'audio/x-wav',     // wav alternative
        'audio/x-m4a',     // m4a
        'audio/mp4',       // m4a alternative
        'audio/aac',       // aac
        'audio/ogg',       // ogg
        'audio/webm',      // webm
      ];
      if (allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new BadRequestException(
          `Unsupported audio format: ${file.mimetype}. Supported formats: mp3, wav, m4a, aac, ogg, webm`
        ), false);
      }
    },
  }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        audio: {
          type: 'string',
          format: 'binary',
          description: 'Audio file (mp3, wav, m4a). Max size: 10MB',
        },
      },
    },
  })
  @ApiOperation({
    summary: 'Extract transactions from audio file',
    description: 'Transcribes an audio file (mp3, wav, m4a) using Vosk and parses it into transaction data. Max file size: 10MB.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid file format or file too large (max 10MB).',
  })
  async createFromAudio(
    @Request() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No audio file provided');
    }
    return this.createTransactionFromAudioUseCase.execute(req.user.userId, file.buffer);
  }
}
