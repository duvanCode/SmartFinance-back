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
    HttpCode,
    HttpStatus,
    Patch,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiUnauthorizedResponse,
    ApiBadRequestResponse,
    ApiNotFoundResponse,
    ApiQuery,
    ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/infrastructure/guards/jwt-auth.guard';
import {
    CreateBudgetDto,
    UpdateBudgetDto,
    BudgetResponseDto,
    BudgetStatusDto,
} from '../../application/dto';
import { CreateBudgetUseCase } from '../../application/use-cases/create-budget.use-case';
import { GetBudgetsUseCase } from '../../application/use-cases/get-budgets.use-case';
import { GetBudgetByIdUseCase } from '../../application/use-cases/get-budget-by-id.use-case';
import { GetBudgetStatusUseCase } from '../../application/use-cases/get-budget-status.use-case';
import { UpdateBudgetUseCase } from '../../application/use-cases/update-budget.use-case';
import { DeleteBudgetUseCase } from '../../application/use-cases/delete-budget.use-case';

interface RequestWithUser extends Request {
    user: {
        userId: string;
        email: string;
    };
}

@ApiTags('Budgets')
@ApiBearerAuth('JWT-auth')
@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetsController {
    constructor(
        private readonly createBudgetUseCase: CreateBudgetUseCase,
        private readonly getBudgetsUseCase: GetBudgetsUseCase,
        private readonly getBudgetByIdUseCase: GetBudgetByIdUseCase,
        private readonly getBudgetStatusUseCase: GetBudgetStatusUseCase,
        private readonly updateBudgetUseCase: UpdateBudgetUseCase,
        private readonly deleteBudgetUseCase: DeleteBudgetUseCase,
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a new budget',
        description: 'Create a spending budget for a specific expense category.',
    })
    @ApiResponse({
        status: 201,
        description: 'Budget created successfully.',
        type: BudgetResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Invalid input or budget rule violation (e.g. duplicate active budget).',
    })
    async create(
        @Request() req: RequestWithUser,
        @Body() dto: CreateBudgetDto,
    ): Promise<BudgetResponseDto> {
        return this.createBudgetUseCase.execute({
            userId: req.user.userId,
            ...dto,
        });
    }

    @Get()
    @ApiOperation({
        summary: 'Get all user budgets',
        description: 'Retrieve all budgets for the authenticated user.',
    })
    @ApiQuery({
        name: 'activeOnly',
        required: false,
        type: Boolean,
        description: 'Filter only active budgets',
    })
    @ApiResponse({
        status: 200,
        description: 'List of budgets.',
        type: [BudgetResponseDto],
    })
    async findAll(
        @Request() req: RequestWithUser,
        @Query('activeOnly') activeOnly?: string,
    ): Promise<BudgetResponseDto[]> {
        return this.getBudgetsUseCase.execute({
            userId: req.user.userId,
            activeOnly: activeOnly === 'true',
        });
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get budget by ID',
        description: 'Retrieve a specific budget details.',
    })
    @ApiResponse({
        status: 200,
        description: 'Budget found.',
        type: BudgetResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Budget not found.',
    })
    async findOne(
        @Request() req: RequestWithUser,
        @Param('id') id: string,
    ): Promise<BudgetResponseDto> {
        return this.getBudgetByIdUseCase.execute({
            id,
            userId: req.user.userId,
        });
    }

    @Get(':id/status')
    @ApiOperation({
        summary: 'Get budget status',
        description: 'Get real-time budget status including spent amount and alerts.',
    })
    @ApiResponse({
        status: 200,
        description: 'Budget status calculated.',
        type: BudgetStatusDto,
    })
    async getStatus(
        @Request() req: RequestWithUser,
        @Param('id') id: string,
    ): Promise<BudgetStatusDto> {
        return this.getBudgetStatusUseCase.execute({
            id,
            userId: req.user.userId,
        });
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Update budget',
        description: 'Update budget amount or period.',
    })
    @ApiResponse({
        status: 200,
        description: 'Budget updated.',
        type: BudgetResponseDto,
    })
    async update(
        @Request() req: RequestWithUser,
        @Param('id') id: string,
        @Body() dto: UpdateBudgetDto,
    ): Promise<BudgetResponseDto> {
        return this.updateBudgetUseCase.execute({
            id,
            userId: req.user.userId,
            ...dto,
        });
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Delete budget',
        description: 'Permanently delete a budget.',
    })
    @ApiResponse({
        status: 204,
        description: 'Budget deleted.',
    })
    async delete(
        @Request() req: RequestWithUser,
        @Param('id') id: string,
    ): Promise<void> {
        await this.deleteBudgetUseCase.execute({
            id,
            userId: req.user.userId,
        });
    }
}
