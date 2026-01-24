import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryType } from '../../domain/enums/category-type.enum';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Groceries',
    minLength: 1,
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Category type (INCOME or EXPENSE)',
    enum: CategoryType,
    example: CategoryType.EXPENSE,
  })
  @IsNotEmpty()
  @IsEnum(CategoryType)
  type: CategoryType;

  @ApiProperty({
    description: 'Category color in hex format',
    example: '#FF5733',
    pattern: '^#[0-9A-Fa-f]{6}$',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid hex color code (e.g., #FF5733)',
  })
  color: string;

  @ApiProperty({
    description: 'Category icon identifier (e.g., Material Icons name)',
    example: 'shopping_cart',
  })
  @IsNotEmpty()
  @IsString()
  icon: string;
}
