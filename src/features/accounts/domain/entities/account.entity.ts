import { BaseEntity } from '@shared/domain/base.entity';
import { AccountType } from '../enums/account-type.enum';

export interface AccountProps {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  currency?: string | null;
  isActive: boolean;
  
  // Specific fields
  bankName?: string | null;
  accountNumber?: string | null;
  creditLimit?: number | null;
  cutoffDate?: number | null;
  paymentDate?: number | null;

  // Snapshot System Fields
  snapshotBalance: number;
  snapshotDate: Date;
  transactionsSinceSnapshot: number;
  snapshotDirty: boolean;

  createdAt?: Date;
  updatedAt?: Date;

  // Calculated at runtime
  balance?: number;
}

export class Account extends BaseEntity {
  private _userId: string;
  private _name: string;
  private _type: AccountType;
  private _currency: string | null;
  private _isActive: boolean;

  private _bankName: string | null;
  private _accountNumber: string | null;
  private _creditLimit: number | null;
  private _cutoffDate: number | null;
  private _paymentDate: number | null;

  private _snapshotBalance: number;
  private _snapshotDate: Date;
  private _transactionsSinceSnapshot: number;
  private _snapshotDirty: boolean;

  private _balance?: number;

  constructor(props: AccountProps) {
    super({
      id: props.id,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
    this._userId = props.userId;
    this._name = props.name;
    this._type = props.type;
    this._currency = props.currency || null;
    this._isActive = props.isActive;

    this._bankName = props.bankName || null;
    this._accountNumber = props.accountNumber || null;
    this._creditLimit = props.creditLimit ?? null;
    this._cutoffDate = props.cutoffDate ?? null;
    this._paymentDate = props.paymentDate ?? null;

    this._snapshotBalance = props.snapshotBalance;
    this._snapshotDate = props.snapshotDate;
    this._transactionsSinceSnapshot = props.transactionsSinceSnapshot;
    this._snapshotDirty = props.snapshotDirty;

    this._balance = props.balance;
  }

  // Basic Getters
  get userId(): string { return this._userId; }
  get name(): string { return this._name; }
  get type(): AccountType { return this._type; }
  get currency(): string | null { return this._currency; }
  get isActive(): boolean { return this._isActive; }

  get bankName(): string | null { return this._bankName; }
  get accountNumber(): string | null { return this._accountNumber; }
  get creditLimit(): number | null { return this._creditLimit; }
  get cutoffDate(): number | null { return this._cutoffDate; }
  get paymentDate(): number | null { return this._paymentDate; }

  get snapshotBalance(): number { return this._snapshotBalance; }
  get snapshotDate(): Date { return this._snapshotDate; }
  get transactionsSinceSnapshot(): number { return this._transactionsSinceSnapshot; }
  get snapshotDirty(): boolean { return this._snapshotDirty; }
  
  get balance(): number | undefined { return this._balance; }
  
  set balance(value: number | undefined) { this._balance = value; }

  // Modifiers
  update(props: Partial<AccountProps>): void {
    if (props.name) this._name = props.name;
    if (props.type) this._type = props.type;
    if (props.currency !== undefined) this._currency = props.currency;
    if (props.isActive !== undefined) this._isActive = props.isActive;
    
    if (props.bankName !== undefined) this._bankName = props.bankName;
    if (props.accountNumber !== undefined) this._accountNumber = props.accountNumber;
    if (props.creditLimit !== undefined) this._creditLimit = props.creditLimit;
    if (props.cutoffDate !== undefined) this._cutoffDate = props.cutoffDate;
    if (props.paymentDate !== undefined) this._paymentDate = props.paymentDate;

    this.updateTimestamp();
  }

  updateSnapshot(newBalance: number): void {
    this._snapshotBalance = newBalance;
    this._snapshotDate = new Date();
    this._transactionsSinceSnapshot = 0;
    this._snapshotDirty = false;
    this.updateTimestamp();
  }

  inactivate(): void {
    this._isActive = false;
    this.updateTimestamp();
  }

  // Factory setup
  static create(props: Omit<AccountProps, 'id' | 'snapshotBalance' | 'snapshotDate' | 'transactionsSinceSnapshot' | 'snapshotDirty' | 'createdAt' | 'updatedAt' | 'isActive'> & { initialDebt?: number }): Account {
    // If it's a credit card and has initial debt, we start the snapshot balance with the debt
    let startingSnapshotBalance = 0;
    if (props.type === AccountType.CREDIT_CARD && props.initialDebt && props.initialDebt > 0) {
      startingSnapshotBalance = props.initialDebt;
    }

    return new Account({
      ...props,
      id: crypto.randomUUID(),
      isActive: true,
      snapshotBalance: startingSnapshotBalance,
      snapshotDate: new Date(),
      transactionsSinceSnapshot: 0,
      snapshotDirty: false,
    });
  }

  // Persistence methods
  toPersistence() {
    return {
      id: this.id,
      userId: this._userId,
      name: this._name,
      type: this._type,
      currency: this._currency,
      isActive: this._isActive,
      bankName: this._bankName,
      accountNumber: this._accountNumber,
      creditLimit: this._creditLimit,
      cutoffDate: this._cutoffDate,
      paymentDate: this._paymentDate,
      snapshotBalance: this._snapshotBalance,
      snapshotDate: this._snapshotDate,
      transactionsSinceSnapshot: this._transactionsSinceSnapshot,
      snapshotDirty: this._snapshotDirty,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromPersistence(data: {
    id: string;
    userId: string;
    name: string;
    type: AccountType;
    currency: string | null;
    isActive: boolean;
    bankName: string | null;
    accountNumber: string | null;
    creditLimit: number | null;
    cutoffDate: number | null;
    paymentDate: number | null;
    snapshotBalance: number;
    snapshotDate: Date;
    transactionsSinceSnapshot: number;
    snapshotDirty: boolean;
    createdAt: Date;
    updatedAt: Date;
    balance?: number;
  }): Account {
    return new Account({
      id: data.id,
      userId: data.userId,
      name: data.name,
      type: data.type,
      currency: data.currency,
      isActive: data.isActive,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      creditLimit: data.creditLimit,
      cutoffDate: data.cutoffDate,
      paymentDate: data.paymentDate,
      snapshotBalance: data.snapshotBalance,
      snapshotDate: data.snapshotDate,
      transactionsSinceSnapshot: data.transactionsSinceSnapshot,
      snapshotDirty: data.snapshotDirty,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      balance: data.balance,
    });
  }
}
