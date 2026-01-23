import { BaseEntity } from '@shared/domain/base.entity';
import { CategoryName } from '../value-objects/category-name.vo';
import { CategoryColor } from '../value-objects/category-color.vo';
import { CategoryType } from '../enums/category-type.enum';

export interface CategoryProps {
  id: string;
  userId: string;
  name: CategoryName;
  type: CategoryType;
  color: CategoryColor;
  icon: string;
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Category extends BaseEntity {
  private _userId: string;
  private _name: CategoryName;
  private _type: CategoryType;
  private _color: CategoryColor;
  private _icon: string;
  private _isDefault: boolean;

  constructor(props: CategoryProps) {
    super({
      id: props.id,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
    this._userId = props.userId;
    this._name = props.name;
    this._type = props.type;
    this._color = props.color;
    this._icon = props.icon;
    this._isDefault = props.isDefault || false;
  }

  // Getters
  get userId(): string {
    return this._userId;
  }

  get name(): CategoryName {
    return this._name;
  }

  get type(): CategoryType {
    return this._type;
  }

  get color(): CategoryColor {
    return this._color;
  }

  get icon(): string {
    return this._icon;
  }

  get isDefault(): boolean {
    return this._isDefault;
  }

  // Business methods
  update(name: CategoryName, color: CategoryColor, icon: string): void {
    if (this._isDefault) {
      throw new Error('Cannot modify default categories');
    }

    this.validateIcon(icon);

    this._name = name;
    this._color = color;
    this._icon = icon;
    this.updateTimestamp();
  }

  private validateIcon(icon: string): void {
    if (!icon || icon.trim().length === 0) {
      throw new Error('Icon cannot be empty');
    }

    if (icon.length > 10) {
      throw new Error('Icon is too long');
    }
  }

  // Factory method
  static create(
    userId: string,
    name: string,
    type: CategoryType,
    color: string,
    icon: string,
    isDefault: boolean = false,
  ): Category {
    const category = new Category({
      id: crypto.randomUUID(),
      userId,
      name: new CategoryName(name),
      type,
      color: new CategoryColor(color),
      icon,
      isDefault,
    });

    category.validateIcon(icon);
    return category;
  }

  // Persistence methods
  toPersistence() {
    return {
      id: this.id,
      userId: this._userId,
      name: this._name.getValue(),
      type: this._type,
      color: this._color.getValue(),
      icon: this._icon,
      isDefault: this._isDefault,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromPersistence(data: {
    id: string;
    userId: string;
    name: string;
    type: CategoryType;
    color: string;
    icon: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Category {
    return new Category({
      id: data.id,
      userId: data.userId,
      name: new CategoryName(data.name),
      type: data.type,
      color: new CategoryColor(data.color),
      icon: data.icon,
      isDefault: data.isDefault,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
