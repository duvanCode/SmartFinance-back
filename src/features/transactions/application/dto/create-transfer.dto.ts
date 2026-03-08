import { IsNotEmpty, IsNumber, IsString, IsDateString, IsUUID, Min, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransferDto {
    @ApiProperty({
        description: 'Source account ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsNotEmpty()
    @IsUUID()
    sourceAccountId: string;

    @ApiProperty({
        description: 'Destination account ID',
        example: '660e8400-e29b-41d4-a716-446655440001',
    })
    @IsNotEmpty()
    @IsUUID()
    destinationAccountId: string;

    @ApiProperty({
        description: 'Category ID for the expense on the source account',
        example: '770e8400-e29b-41d4-a716-446655440002',
    })
    @IsNotEmpty()
    @IsUUID()
    sourceCategoryId: string;

    @ApiProperty({
        description: 'Category ID for the income on the destination account',
        example: '880e8400-e29b-41d4-a716-446655440003',
    })
    @IsNotEmpty()
    @IsUUID()
    destinationCategoryId: string;

    @ApiProperty({
        description: 'Transfer amount (must be positive)',
        example: 150.5,
        minimum: 0.01,
    })
    @IsNotEmpty()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    amount: number;

    @ApiProperty({
        description: 'Transfer description',
        example: 'Transfer between my accounts',
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(255)
    description: string;

    @ApiProperty({
        description: 'Transfer date',
        example: '2024-01-15T10:30:00.000Z',
    })
    @IsNotEmpty()
    @IsDateString()
    date: string;
}
