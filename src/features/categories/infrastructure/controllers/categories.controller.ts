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

/**
 * Categories Controller
 * 
 * Handles HTTP endpoints for category management:
 * - Create custom categories for income/expense classification
 * - Retrieve user categories with optional type filtering
 * - Update existing categories (excluding defaults)
 * - Delete custom categories (excluding defaults)
 * 
 * All endpoints require JWT authentication.
 */
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
    constructor(
        private readonly createCategoryUseCase: CreateCategoryUseCase,
        private readonly getCategoriesByUserIdUseCase: GetCategoriesByUserIdUseCase,
        private readonly updateCategoryUseCase: UpdateCategoryUseCase,
        private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
    ) { }

    /**
     * Create a new category
     * POST /categories
     * 
     * @param req - Request with authenticated user
     * @param dto - Category creation data
     * @returns Created category
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
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

    /**
     * Get all categories for the authenticated user
     * GET /categories
     * GET /categories?type=INCOME
     * GET /categories?type=EXPENSE
     * 
     * @param req - Request with authenticated user
     * @param type - Optional filter by category type
     * @returns Array of categories
     */
    @Get()
    async findAll(
        @Request() req: RequestWithUser,
        @Query('type') type?: string,
    ): Promise<CategoryResponseDto[]> {
        const categoryType = type
            ? (type.toUpperCase() as CategoryType)
            : undefined;

        return this.getCategoriesByUserIdUseCase.execute({
            userId: req.user.userId,
            type: categoryType,
        });
    }

    /**
     * Update a category
     * PUT /categories/:id
     * 
     * Note: Default categories cannot be updated
     * 
     * @param req - Request with authenticated user
     * @param id - Category ID
     * @param dto - Update data
     * @returns Updated category
     */
    @Put(':id')
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

    /**
     * Delete a category
     * DELETE /categories/:id
     * 
     * Note: Default categories cannot be deleted
     * 
     * @param req - Request with authenticated user
     * @param id - Category ID
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
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
