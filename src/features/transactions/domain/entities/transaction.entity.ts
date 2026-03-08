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
  accountId: string;
  transferGroupId?: string;
  amount: Money;
  type: TransactionType;
  description: string;
  date: TransactionDate;
  source?: InputSource;
  rawInput?: string;
  aiConfidence?: number;
  isLoan?: boolean;
  loanId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Transaction extends BaseEntity {
  private _userId: string;
  private _categoryId: string;
  private _accountId: string;
  private _transferGroupId?: string;
  private _amount: Money;
  private _type: TransactionType;
  private _description: string;
  private _date: TransactionDate;
  private _source: InputSource;
  private _rawInput?: string;
  private _aiConfidence?: number;
  private _isLoan: boolean;
  private _loanId?: string;

  constructor(props: TransactionProps) {
    super({
      id: props.id,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
    this._userId = props.userId;
    this._categoryId = props.categoryId;
    this._accountId = props.accountId;
    this._transferGroupId = props.transferGroupId;
    this._amount = props.amount;
    this._type = props.type;
    this._description = props.description;
    this._date = props.date;
    this._source = props.source || InputSource.MANUAL;
    this._rawInput = props.rawInput;
    this._aiConfidence = props.aiConfidence;
    this._isLoan = props.isLoan || false;
    this._loanId = props.loanId;
  }

  // Getters
  get userId(): string {
    return this._userId;
  }

  get categoryId(): string {
    return this._categoryId;
  }

  get accountId(): string {
    return this._accountId;
  }

  get transferGroupId(): string | undefined {
    return this._transferGroupId;
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

  get isLoan(): boolean {
    return this._isLoan;
  }

  get loanId(): string | undefined {
    return this._loanId;
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
    accountId: string,
    date: TransactionDate,
  ): void {
    this.validateCategoryId(categoryId);
    this.validateAccountId(accountId);
    this.validateDescription(description);

    this._description = description;
    this._amount = amount;
    this._categoryId = categoryId;
    this._accountId = accountId;
    this._date = date;
    this.updateTimestamp();
  }

  private validateCategoryId(categoryId: string): void {
    if (!categoryId || categoryId.trim().length === 0) {
      throw new Error('Category ID cannot be empty');
    }
  }

  private validateAccountId(accountId: string): void {
    if (!accountId || accountId.trim().length === 0) {
      throw new Error('Account ID cannot be empty');
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
    accountId: string,
    amount: number,
    type: TransactionType,
    description: string,
    date: Date | string,
    source: InputSource = InputSource.MANUAL,
    rawInput?: string,
    aiConfidence?: number,
    transferGroupId?: string,
  ): Transaction {
    // Validations
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID cannot be empty');
    }
    if (!categoryId || categoryId.trim().length === 0) {
      throw new Error('Category ID cannot be empty');
    }
    if (!accountId || accountId.trim().length === 0) {
      throw new Error('Account ID cannot be empty');
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
      accountId,
      amount: new Money(amount),
      type,
      description: description.trim(),
      date: new TransactionDate(date),
      source,
      rawInput,
      aiConfidence,
      transferGroupId,
    });
  }

  // Persistence methods
  toPersistence() {
    return {
      id: this.id,
      userId: this._userId,
      categoryId: this._categoryId,
      accountId: this._accountId,
      amount: this._amount.getValue(),
      type: this._type,
      description: this._description,
      date: this._date.getValue(),
      source: this._source,
      rawInput: this._rawInput,
      aiConfidence: this._aiConfidence,
      transferGroupId: this._transferGroupId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromPersistence(data: {
    id: string;
    userId: string;
    categoryId: string;
    accountId: string | null;
    amount: Decimal;
    type: TransactionType;
    description: string;
    date: Date;
    source: InputSource;
    rawInput: string | null;
    aiConfidence: number | null;
    transferGroupId?: string | null;
    isLoan?: boolean;
    loanId?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Transaction {
    return new Transaction({
      id: data.id,
      userId: data.userId,
      categoryId: data.categoryId,
      accountId: data.accountId || "MIGRATION_REQUIRED", // fallback if null data during migration.
      amount: new Money(data.amount),
      type: data.type,
      description: data.description,
      date: new TransactionDate(data.date),
      source: data.source,
      rawInput: data.rawInput ?? undefined,
      aiConfidence: data.aiConfidence ?? undefined,
      transferGroupId: data.transferGroupId ?? undefined,
      isLoan: data.isLoan ?? false,
      loanId: data.loanId ?? undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
