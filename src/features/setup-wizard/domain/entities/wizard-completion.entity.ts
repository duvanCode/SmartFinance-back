export interface WizardAccountInput {
  name: string;
  type: 'CASH' | 'DIGITAL_WALLET' | 'BANK_ACCOUNT' | 'CREDIT_CARD';
  balance: number;
  bankName?: string;
  creditLimit?: number;
}

export class WizardCompletion {
  constructor(
    public readonly userId: string,
    public readonly accounts: WizardAccountInput[],
  ) {
    if (!userId) throw new Error('userId is required');
    if (!Array.isArray(accounts) || accounts.length === 0) {
      throw new Error('At least one account is required to complete setup');
    }
  }
}
