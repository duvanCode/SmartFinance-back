import { CategoryType } from '../../domain/enums/category-type.enum';

export class CategoryResponseDto {
    id: string;
    userId: string;
    name: string;
    type: CategoryType;
    color: string;
    icon: string;
    isDefault: boolean;
    createdAt: Date;
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
