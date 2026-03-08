import { IsEnum, IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';
import { LoanType } from '@prisma/client';

export class UpdateLoanDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    initialAmount?: number;

    @IsOptional()
    @IsEnum(LoanType)
    type?: LoanType;

    @IsOptional()
    @IsDateString()
    startDate?: string;

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
