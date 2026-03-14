import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum WizardAccountType {
  CASH = 'CASH',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  CREDIT_CARD = 'CREDIT_CARD',
}

export class WizardAccountDto {
  @ApiProperty({ description: 'Account name', example: 'Main Checking' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: WizardAccountType, description: 'Account type' })
  @IsEnum(WizardAccountType)
  type: WizardAccountType;

  @ApiProperty({ description: 'Current balance', example: 1500.00 })
  @IsNumber()
  @Min(0)
  balance: number;

  @ApiPropertyOptional({ description: 'Bank or wallet name', example: 'Bancolombia' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ description: 'Credit limit (only for CREDIT_CARD)', example: 5000.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;
}

export class CompleteSetupDto {
  @ApiProperty({ type: [WizardAccountDto], description: 'List of initial accounts (minimum one)' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => WizardAccountDto)
  accounts: WizardAccountDto[];
}
