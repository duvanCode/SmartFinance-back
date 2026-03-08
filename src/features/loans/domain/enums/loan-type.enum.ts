export enum LoanType {
    RECEIVED = 'RECEIVED',
    GIVEN = 'GIVEN',
}
  
export const getLoanTypeFromString = (value: string): LoanType => {
    const upperValue = value.toUpperCase();
  
    if (upperValue === 'RECEIVED') return LoanType.RECEIVED;
    if (upperValue === 'GIVEN') return LoanType.GIVEN;
  
    throw new Error(`Invalid loan type: ${value}`);
};
