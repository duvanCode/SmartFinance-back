import { PartialType } from '@nestjs/swagger';
import { CreateAccountDto } from './create-account.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAccountDto extends PartialType(CreateAccountDto) {
    @ApiProperty({
        description: 'Whether the account is active or inactive',
        example: false,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
