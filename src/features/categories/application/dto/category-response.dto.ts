import { ApiProperty } from '@nestjs/swagger';
import { CategoryType } from '../../domain/enums/category-type.enum';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Category unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who owns this category',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  userId: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Groceries',
  })
  name: string;

  @ApiProperty({
    description: 'Category type',
    enum: CategoryType,
    example: CategoryType.EXPENSE,
  })
  type: CategoryType;

  @ApiProperty({
    description: 'Category color in hex format',
    example: '#FF5733',
  })
  color: string;

  @ApiProperty({
    description: 'Category icon identifier',
    example: 'shopping_cart',
  })
  icon: string;

  @ApiProperty({
    description: 'Whether this is a system default category',
    example: false,
  })
  isDefault: boolean;

  @ApiProperty({
    description: 'Category creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Category last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;

  constructor(data: {
    id: string;
    userId: string;
    name: string;
    type: CategoryType;
    color: string;
    icon: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.userId = data.userId;
    this.name = data.name;
    this.type = data.type;
    this.color = data.color;
    this.icon = data.icon;
    this.isDefault = data.isDefault;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
