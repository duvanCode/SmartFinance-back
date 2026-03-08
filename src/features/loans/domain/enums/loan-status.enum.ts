export enum LoanStatus {
    ACTIVE = 'ACTIVE',
    PAID = 'PAID',
    CANCELLED = 'CANCELLED',
}
  
export const getLoanStatusFromString = (value: string): LoanStatus => {
    const upperValue = value.toUpperCase();

    if (upperValue === 'ACTIVE') return LoanStatus.ACTIVE;
    if (upperValue === 'PAID') return LoanStatus.PAID;
    if (upperValue === 'CANCELLED') return LoanStatus.CANCELLED;

    throw new Error(`Invalid loan status: ${value}`);
};
