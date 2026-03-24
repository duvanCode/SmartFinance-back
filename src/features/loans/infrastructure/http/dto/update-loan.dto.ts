import { IsEnum, IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LoanType } from '@prisma/client';

export class UpdateLoanDto {
    @ApiPropertyOptional({ description: 'Nombre o concepto del préstamo', example: 'Préstamo vehículo' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ description: 'Monto inicial', example: 5000 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    initialAmount?: number;

    @ApiPropertyOptional({ description: 'Tipo de préstamo', enum: LoanType, example: LoanType.RECEIVED })
    @IsOptional()
    @IsEnum(LoanType)
    type?: LoanType;

    @ApiPropertyOptional({ description: 'Fecha de inicio', example: '2024-03-24T00:00:00.000Z' })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({ description: 'Tasa de interés', example: 1.5 })
    @IsOptional()
    @IsNumber()
    interestRate?: number;

    @ApiPropertyOptional({ description: 'Nombre categoría opcional', example: 'Préstamos' })
    @IsOptional()
    @IsString()
    categoryName?: string;

    @ApiPropertyOptional({ description: 'ID de la categoría', example: 'uuid' })
    @IsOptional()
    @IsString()
    categoryId?: string;

    @ApiPropertyOptional({ description: 'Prestamista o deudor', example: 'Banco' })
    @IsOptional()
    @IsString()
    creditorDebtor?: string;

    @ApiPropertyOptional({ description: 'Notas opcionales', example: 'A 24 meses' })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({ description: 'ID de la cuenta', example: 'uuid' })
    @IsOptional()
    @IsString()
    accountId?: string;
}
