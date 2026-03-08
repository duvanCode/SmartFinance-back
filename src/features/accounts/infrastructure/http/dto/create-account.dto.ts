import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '@prisma/client';

export class CreateAccountDto {
    @ApiProperty({
        description: 'Name of the account',
        example: 'Main Checking Account',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Type of the account',
        enum: AccountType,
        example: AccountType.BANK_ACCOUNT,
    })
    @IsNotEmpty()
    @IsEnum(AccountType)
    type: AccountType;

    @ApiProperty({
        description: 'Currency of the account (optional, defaults to USD)',
        example: 'USD',
        required: false,
    })
    @IsOptional()
    @IsString()
    currency?: string;

    @ApiProperty({
        description: 'Bank name if applicable',
        example: 'Bancolombia',
        required: false,
    })
    @IsOptional()
    @IsString()
    bankName?: string;

    @ApiProperty({
        description: 'Account number if applicable',
        example: '1234567890',
        required: false,
    })
    @IsOptional()
    @IsString()
    accountNumber?: string;

    @ApiProperty({
        description: 'Total credit limit if the account is a credit card',
        example: 5000,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    creditLimit?: number;

    @ApiProperty({
        description: 'Cutoff day of the month for credit cards (1-31)',
        example: 15,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(31)
    cutoffDate?: number;

    @ApiProperty({
        description: 'Payment day of the month for credit cards (1-31)',
        example: 5,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(31)
    paymentDate?: number;

    @ApiProperty({
        description: 'Initial debt for credit cards, used to create the opening transaction',
        example: 1500,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    initialDebt?: number;
}
