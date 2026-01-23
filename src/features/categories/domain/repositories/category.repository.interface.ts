import { Category } from '../entities/category.entity';
import { CategoryType } from '../enums/category-type.enum';

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findByUserId(userId: string): Promise<Category[]>;
  findByUserIdAndType(userId: string, type: CategoryType): Promise<Category[]>;
  findByUserIdAndName(userId: string, name: string): Promise<Category | null>;
  create(category: Category): Promise<Category>;
  update(category: Category): Promise<Category>;
  delete(id: string): Promise<void>;
  existsByUserIdAndName(userId: string, name: string): Promise<boolean>;
}

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');
