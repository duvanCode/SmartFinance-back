import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';

export class RegisterPaymentDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    amount: number;

    @IsNotEmpty()
    @IsDateString()
    date: string;

    @IsOptional()
    @IsString()
    description?: string;

    // Ideally, payments always link to the loan, but we might want to specify if it's counting differently
    // For now, simple payment info is enough. The service will handle type (INCOME/EXPENSE) based on LoanType.
}
