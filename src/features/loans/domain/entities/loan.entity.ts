import { BaseEntity } from '@shared/domain/base.entity';
import { LoanType } from '../enums/loan-type.enum';
import { LoanStatus } from '../enums/loan-status.enum';

export interface LoanProps {
  id: string;
  userId: string;
  name: string;
  initialAmount: number;
  paidAmount: number;
  pendingAmount: number;
  interestRate?: number | null;
  type: LoanType;
  status: LoanStatus;
  startDate: Date;
  categoryName?: string | null;
  notes?: string | null;
  creditorDebtor?: string | null;
  categoryId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Calculated dynamically
  interestAmount?: number;
}

export class Loan extends BaseEntity {
  private _userId: string;
  private _name: string;
  private _initialAmount: number;
  private _paidAmount: number;
  private _pendingAmount: number;
  private _interestRate: number | null;
  private _type: LoanType;
  private _status: LoanStatus;
  private _startDate: Date;
  private _categoryName: string | null;
  private _notes: string | null;
  private _creditorDebtor: string | null;
  private _categoryId: string | null;
  private _interestAmount: number;

  constructor(props: LoanProps) {
    super({
      id: props.id,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
    this._userId = props.userId;
    this._name = props.name;
    this._initialAmount = props.initialAmount;
    this._paidAmount = props.paidAmount;
    this._pendingAmount = props.pendingAmount;
    this._interestRate = props.interestRate ?? null;
    this._type = props.type;
    this._status = props.status;
    this._startDate = props.startDate;
    this._categoryName = props.categoryName ?? null;
    this._notes = props.notes ?? null;
    this._creditorDebtor = props.creditorDebtor ?? null;
    this._categoryId = props.categoryId ?? null;
    this._interestAmount = props.interestAmount ?? 0;
  }

  // Getters
  get userId(): string { return this._userId; }
  get name(): string { return this._name; }
  get initialAmount(): number { return this._initialAmount; }
  get paidAmount(): number { return this._paidAmount; }
  get pendingAmount(): number { return this._pendingAmount; }
  get interestRate(): number | null { return this._interestRate; }
  get type(): LoanType { return this._type; }
  get status(): LoanStatus { return this._status; }
  get startDate(): Date { return this._startDate; }
  get categoryName(): string | null { return this._categoryName; }
  get notes(): string | null { return this._notes; }
  get creditorDebtor(): string | null { return this._creditorDebtor; }
  get categoryId(): string | null { return this._categoryId; }
  get interestAmount(): number { return this._interestAmount; }

  // Modifiers
  update(props: Partial<LoanProps>): void {
    if (props.name) this._name = props.name;
    if (props.initialAmount !== undefined) this._initialAmount = props.initialAmount;
    if (props.type) this._type = props.type;
    if (props.startDate) this._startDate = props.startDate;
    if (props.interestRate !== undefined) this._interestRate = props.interestRate ?? null;
    if (props.categoryName !== undefined) this._categoryName = props.categoryName ?? null;
    if (props.creditorDebtor !== undefined) this._creditorDebtor = props.creditorDebtor ?? null;
    if (props.notes !== undefined) this._notes = props.notes ?? null;
    if (props.categoryId !== undefined) this._categoryId = props.categoryId ?? null;

    this.updateTimestamp();
  }

  markAsPaid(): void {
    this._status = LoanStatus.PAID;
    this.updateTimestamp();
  }
  
  setCalculatedTotals(paid: number, pending: number, interest: number): void {
      this._paidAmount = paid;
      this._pendingAmount = pending;
      this._interestAmount = interest;
  }

  // Factory Method
  static create(props: Omit<LoanProps, 'id' | 'paidAmount' | 'pendingAmount' | 'status' | 'createdAt' | 'updatedAt' | 'interestAmount'>): Loan {
    return new Loan({
      ...props,
      id: crypto.randomUUID(),
      paidAmount: 0,
      pendingAmount: props.initialAmount,
      status: LoanStatus.ACTIVE,
    });
  }

  // Persistence methods
  toPersistence() {
    return {
      id: this.id,
      userId: this._userId,
      name: this._name,
      initialAmount: this._initialAmount,
      paidAmount: this._paidAmount,
      pendingAmount: this._pendingAmount,
      interestRate: this._interestRate,
      type: this._type,
      status: this._status,
      startDate: this._startDate,
      categoryName: this._categoryName,
      notes: this._notes,
      creditorDebtor: this._creditorDebtor,
      categoryId: this._categoryId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromPersistence(data: {
    id: string;
    userId: string;
    name: string;
    initialAmount: number;
    paidAmount: number;
    pendingAmount: number;
    interestRate: number | null;
    type: LoanType;
    status: LoanStatus;
    startDate: Date;
    categoryName: string | null;
    notes: string | null;
    creditorDebtor: string | null;
    categoryId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Loan {
    return new Loan({
      id: data.id,
      userId: data.userId,
      name: data.name,
      initialAmount: data.initialAmount,
      paidAmount: data.paidAmount,
      pendingAmount: data.pendingAmount,
      interestRate: data.interestRate,
      type: data.type,
      status: data.status,
      startDate: data.startDate,
      categoryName: data.categoryName,
      notes: data.notes,
      creditorDebtor: data.creditorDebtor,
      categoryId: data.categoryId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  // Used by JSON.stringify (and thus NestJS serialization)
  toJSON() {
    return {
      id: this.id,
      userId: this._userId,
      name: this._name,
      initialAmount: this._initialAmount,
      paidAmount: this._paidAmount,
      pendingAmount: this._pendingAmount,
      interestRate: this._interestRate,
      type: this._type,
      status: this._status,
      startDate: this._startDate,
      categoryName: this._categoryName,
      notes: this._notes,
      creditorDebtor: this._creditorDebtor,
      categoryId: this._categoryId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      interestAmount: this._interestAmount,
    };
  }
}
