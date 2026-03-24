import { Loan } from '../entities/loan.entity';
import { LoanType } from '../enums/loan-type.enum';

export interface ILoanRepository {
  findById(id: string): Promise<Loan | null>;
  findByUserId(userId: string): Promise<Loan[]>;
  create(loan: Loan): Promise<Loan>;
  update(loan: Loan): Promise<Loan>;
  delete(id: string): Promise<void>;
  
  // Need custom queries due to transaction calculation logic
  findActiveLoanByCategoryId(userId: string, categoryId: string, excludeLoanId?: string): Promise<Loan | null>;
  getOrCreateLoanCategory(userId: string): Promise<string>;
  createCategoryForLoan(userId: string, name: string, type: string): Promise<string>;
  updateCategoryType(categoryId: string, type: string): Promise<void>;
  createInitialDisbursementTransaction(
      userId: string, 
      categoryId: string, 
      amount: number, 
      type: string, 
      description: string, 
      date: Date, 
      loanId: string,
      accountId: string
  ): Promise<void>;
  updateInitialDisbursementTransaction(
      loanId: string, 
      amount: number, 
      categoryId: string, 
      date: Date | undefined, 
      description: string | undefined, 
      type: string,
      accountId?: string
  ): Promise<void>;
  deleteTransactionsByLoanId(loanId: string, userId: string): Promise<void>;
  calculateLoanDetails(userId: string, loan: Loan): Promise<Loan>;
}

export const LOAN_REPOSITORY = Symbol('LOAN_REPOSITORY');
