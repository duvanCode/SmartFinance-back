import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterPaymentDto {
    @ApiProperty({ description: 'Monto del pago', example: 500 })
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    amount: number;

    @ApiProperty({ description: 'Fecha', example: '2024-03-24T00:00:00.000Z' })
    @IsNotEmpty()
    @IsDateString()
    date: string;

    @ApiPropertyOptional({ description: 'Descripción', example: 'Cuota 1' })
    @IsOptional()
    @IsString()
    description?: string;
}
