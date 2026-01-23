import { Module } from '@nestjs/common';

// Controllers
import { CategoriesController } from './infrastructure/controllers/categories.controller';

// Use Cases
import { CreateCategoryUseCase } from './application/use-cases/create-category.use-case';
import { GetCategoriesByUserIdUseCase } from './application/use-cases/get-categories-by-user-id.use-case';
import { UpdateCategoryUseCase } from './application/use-cases/update-category.use-case';
import { DeleteCategoryUseCase } from './application/use-cases/delete-category.use-case';

// Repositories
import { CategoryPrismaRepository } from './infrastructure/repositories/category-prisma.repository';
import { CATEGORY_REPOSITORY } from './domain/repositories/category.repository.interface';

// Import AuthModule to use JwtAuthGuard
import { AuthModule } from '@features/auth/auth.module';

@Module({
    imports: [AuthModule],
    controllers: [CategoriesController],
    providers: [
        // Use Cases
        CreateCategoryUseCase,
        GetCategoriesByUserIdUseCase,
        UpdateCategoryUseCase,
        DeleteCategoryUseCase,

        // Repositories
        {
            provide: CATEGORY_REPOSITORY,
            useClass: CategoryPrismaRepository,
        },
    ],
    exports: [CATEGORY_REPOSITORY],
})
export class CategoriesModule { }
