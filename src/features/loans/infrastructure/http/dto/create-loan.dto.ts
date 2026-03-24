import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LoanType } from '@prisma/client';

export class CreateLoanDto {
    @ApiProperty({ description: 'Nombre o concepto del préstamo', example: 'Préstamo vehículo' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'Monto inicial', example: 5000 })
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    initialAmount: number;

    @ApiProperty({ description: 'Tipo de préstamo', enum: LoanType, example: LoanType.RECEIVED })
    @IsNotEmpty()
    @IsEnum(LoanType)
    type: LoanType;

    @ApiProperty({ description: 'Fecha de inicio', example: '2024-03-24T00:00:00.000Z' })
    @IsNotEmpty()
    @IsDateString()
    startDate: string; // ISO Date

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

    @ApiProperty({ description: 'ID de cuenta obligatoria', example: 'uuid' })
    @IsNotEmpty()
    @IsString()
    accountId: string;
}
