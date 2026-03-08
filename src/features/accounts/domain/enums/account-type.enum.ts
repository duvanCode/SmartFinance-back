export enum AccountType {
  CASH = 'CASH',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  CREDIT_CARD = 'CREDIT_CARD',
  SYSTEM = 'SYSTEM',
}

export const getAccountTypeFromString = (value: string): AccountType => {
  const upperValue = value.toUpperCase();

  if (upperValue === 'CASH') return AccountType.CASH;
  if (upperValue === 'DIGITAL_WALLET') return AccountType.DIGITAL_WALLET;
  if (upperValue === 'BANK_ACCOUNT') return AccountType.BANK_ACCOUNT;
  if (upperValue === 'CREDIT_CARD') return AccountType.CREDIT_CARD;
  if (upperValue === 'SYSTEM') return AccountType.SYSTEM;

  throw new Error(`Invalid account type: ${value}`);
};
