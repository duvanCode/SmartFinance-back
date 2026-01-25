import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFromTextDto {
    @ApiProperty({
        description: 'Natural language text describing transactions',
        example: 'Gaste 50 dolares en Uber y 20 en comida',
    })
    @IsString()
    @IsNotEmpty()
    text: string;
}
