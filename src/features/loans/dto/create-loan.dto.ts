import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';
import { LoanType } from '@prisma/client';

export class CreateLoanDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    initialAmount: number;

    @IsNotEmpty()
    @IsEnum(LoanType)
    type: LoanType;

    @IsNotEmpty()
    @IsDateString()
    startDate: string; // ISO Date

    @IsOptional()
    @IsNumber()
    interestRate?: number;

    @IsOptional()
    @IsString()
    categoryName?: string;

    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsString()
    creditorDebtor?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}
