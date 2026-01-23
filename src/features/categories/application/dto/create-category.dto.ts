import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';
import { CategoryType } from '../../domain/enums/category-type.enum';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(CategoryType)
  type: CategoryType;

  @IsNotEmpty()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid hex color code (e.g., #FF5733)',
  })
  color: string;

  @IsNotEmpty()
  @IsString()
  icon: string;
}
