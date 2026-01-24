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
} from '@nestjs/common';
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/infrastructure/guards/jwt-auth.guard';
import { CreateCategoryDto } from '../../application/dto/create-category.dto';
import { UpdateCategoryDto } from '../../application/dto/update-category.dto';
import { CategoryResponseDto } from '../../application/dto/category-response.dto';
import { CreateCategoryUseCase } from '../../application/use-cases/create-category.use-case';
import { GetCategoriesByUserIdUseCase } from '../../application/use-cases/get-categories-by-user-id.use-case';
import { UpdateCategoryUseCase } from '../../application/use-cases/update-category.use-case';
import { DeleteCategoryUseCase } from '../../application/use-cases/delete-category.use-case';
import { CategoryType } from '../../domain/enums/category-type.enum';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@ApiTags('Categories')
@ApiBearerAuth('JWT-auth')
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly getCategoriesByUserIdUseCase: GetCategoriesByUserIdUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new category',
    description: 'Create a custom category for income or expense classification.',
  })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully.',
    type: CategoryResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body or validation error.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing JWT token.',
  })
  async create(
    @Request() req: RequestWithUser,
    @Body() dto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.createCategoryUseCase.execute({
      userId: req.user.userId,
      name: dto.name,
      type: dto.type,
      color: dto.color,
      icon: dto.icon,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Retrieve all categories for the authenticated user. Optionally filter by type.',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: CategoryType,
    description: 'Filter categories by type (INCOME or EXPENSE)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of categories.',
    type: [CategoryResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing JWT token.',
  })
  async findAll(
    @Request() req: RequestWithUser,
    @Query('type') type?: string,
  ): Promise<CategoryResponseDto[]> {
    const categoryType = type ? (type.toUpperCase() as CategoryType) : undefined;

    return this.getCategoriesByUserIdUseCase.execute({
      userId: req.user.userId,
      type: categoryType,
    });
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a category',
    description: 'Update an existing category. Default categories cannot be updated.',
  })
  @ApiParam({
    name: 'id',
    description: 'Category UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully.',
    type: CategoryResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body or validation error.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing JWT token.',
  })
  @ApiNotFoundResponse({
    description: 'Category not found.',
  })
  @ApiForbiddenResponse({
    description: 'Cannot update default categories.',
  })
  async update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.updateCategoryUseCase.execute({
      id,
      userId: req.user.userId,
      name: dto.name,
      color: dto.color,
      icon: dto.icon,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a category',
    description: 'Delete an existing category. Default categories cannot be deleted.',
  })
  @ApiParam({
    name: 'id',
    description: 'Category UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'Category deleted successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing JWT token.',
  })
  @ApiNotFoundResponse({
    description: 'Category not found.',
  })
  @ApiForbiddenResponse({
    description: 'Cannot delete default categories.',
  })
  async delete(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.deleteCategoryUseCase.execute({
      id,
      userId: req.user.userId,
    });
  }
}
