import { Decimal } from '@prisma/client/runtime/library';
import { BaseEntity } from '@shared/domain/base.entity';
import { Money } from '../value-objects/money.vo';
import { TransactionDate } from '../value-objects/transaction-date.vo';
import { TransactionType } from '../enums/transaction-type.enum';
import { InputSource } from '../enums/input-source.enum';

export interface TransactionProps {
  id: string;
  userId: string;
  categoryId: string;
  amount: Money;
  type: TransactionType;
  description: string;
  date: TransactionDate;
  source?: InputSource;
  rawInput?: string;
  aiConfidence?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Transaction extends BaseEntity {
  private _userId: string;
  private _categoryId: string;
  private _amount: Money;
  private _type: TransactionType;
  private _description: string;
  private _date: TransactionDate;
  private _source: InputSource;
  private _rawInput?: string;
  private _aiConfidence?: number;

  constructor(props: TransactionProps) {
    super({
      id: props.id,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
    this._userId = props.userId;
    this._categoryId = props.categoryId;
    this._amount = props.amount;
    this._type = props.type;
    this._description = props.description;
    this._date = props.date;
    this._source = props.source || InputSource.MANUAL;
    this._rawInput = props.rawInput;
    this._aiConfidence = props.aiConfidence;
  }

  // Getters
  get userId(): string {
    return this._userId;
  }

  get categoryId(): string {
    return this._categoryId;
  }

  get amount(): Money {
    return this._amount;
  }

  get type(): TransactionType {
    return this._type;
  }

  get description(): string {
    return this._description;
  }

  get date(): TransactionDate {
    return this._date;
  }

  get source(): InputSource {
    return this._source;
  }

  get rawInput(): string | undefined {
    return this._rawInput;
  }

  get aiConfidence(): number | undefined {
    return this._aiConfidence;
  }

  // Business methods
  isIncome(): boolean {
    return this._type === TransactionType.INCOME;
  }

  isExpense(): boolean {
    return this._type === TransactionType.EXPENSE;
  }

  isFromAI(): boolean {
    return this._source !== InputSource.MANUAL;
  }

  update(
    description: string,
    amount: Money,
    categoryId: string,
    date: TransactionDate,
  ): void {
    this.validateCategoryId(categoryId);
    this.validateDescription(description);

    this._description = description;
    this._amount = amount;
    this._categoryId = categoryId;
    this._date = date;
    this.updateTimestamp();
  }

  private validateCategoryId(categoryId: string): void {
    if (!categoryId || categoryId.trim().length === 0) {
      throw new Error('Category ID cannot be empty');
    }
  }

  private validateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new Error('Description cannot be empty');
    }
    if (description.length > 200) {
      throw new Error('Description is too long (max 200 characters)');
    }
  }

  // Factory method
  static create(
    userId: string,
    categoryId: string,
    amount: number,
    type: TransactionType,
    description: string,
    date: Date | string,
    source: InputSource = InputSource.MANUAL,
    rawInput?: string,
    aiConfidence?: number,
  ): Transaction {
    // Validations
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID cannot be empty');
    }
    if (!categoryId || categoryId.trim().length === 0) {
      throw new Error('Category ID cannot be empty');
    }
    if (!description || description.trim().length === 0) {
      throw new Error('Description cannot be empty');
    }
    if (description.length > 200) {
      throw new Error('Description is too long (max 200 characters)');
    }

    return new Transaction({
      id: crypto.randomUUID(),
      userId,
      categoryId,
      amount: new Money(amount),
      type,
      description: description.trim(),
      date: new TransactionDate(date),
      source,
      rawInput,
      aiConfidence,
    });
  }

  // Persistence methods
  toPersistence() {
    return {
      id: this.id,
      userId: this._userId,
      categoryId: this._categoryId,
      amount: this._amount.getValue(),
      type: this._type,
      description: this._description,
      date: this._date.getValue(),
      source: this._source,
      rawInput: this._rawInput,
      aiConfidence: this._aiConfidence,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromPersistence(data: {
    id: string;
    userId: string;
    categoryId: string;
    amount: Decimal;
    type: TransactionType;
    description: string;
    date: Date;
    source: InputSource;
    rawInput: string | null;
    aiConfidence: number | null;
    createdAt: Date;
    updatedAt: Date;
  }): Transaction {
    return new Transaction({
      id: data.id,
      userId: data.userId,
      categoryId: data.categoryId,
      amount: new Money(data.amount),
      type: data.type,
      description: data.description,
      date: new TransactionDate(data.date),
      source: data.source,
      rawInput: data.rawInput ?? undefined,
      aiConfidence: data.aiConfidence ?? undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
