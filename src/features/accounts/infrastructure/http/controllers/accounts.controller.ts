import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
    Put
} from '@nestjs/common';
import { JwtAuthGuard } from '@features/auth/infrastructure/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { CreateAccountDto } from '../dto/create-account.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';

import { CreateAccountUseCase } from '../../../application/use-cases/create-account.use-case';
import { GetAccountsByUserIdUseCase } from '../../../application/use-cases/get-accounts-by-user-id.use-case';
import { GetAccountByIdUseCase } from '../../../application/use-cases/get-account-by-id.use-case';
import { UpdateAccountUseCase } from '../../../application/use-cases/update-account.use-case';
import { InactivateAccountUseCase } from '../../../application/use-cases/inactivate-account.use-case';

interface RequestWithUser extends Request {
    user: {
        userId: string;
        email: string;
    };
}

@ApiTags('Accounts')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
    constructor(
        private readonly createAccountUseCase: CreateAccountUseCase,
        private readonly getAccountsByUserIdUseCase: GetAccountsByUserIdUseCase,
        private readonly getAccountByIdUseCase: GetAccountByIdUseCase,
        private readonly updateAccountUseCase: UpdateAccountUseCase,
        private readonly inactivateAccountUseCase: InactivateAccountUseCase,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a new account' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Account created successfully' })
    @HttpCode(HttpStatus.CREATED)
    create(@Request() req: RequestWithUser, @Body() createAccountDto: CreateAccountDto) {
        return this.createAccountUseCase.execute({
            ...createAccountDto,
            userId: req.user.userId
        });
    }

    @Get()
    @ApiOperation({ summary: 'Get all accounts for the user' })
    @ApiResponse({ status: HttpStatus.OK, description: 'List of accounts with their calculated balances' })
    findAll(@Request() req: RequestWithUser) {
        return this.getAccountsByUserIdUseCase.execute(req.user.userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific account by ID' })
    findAllById(@Request() req: RequestWithUser, @Param('id') id: string) {
        return this.getAccountByIdUseCase.execute(id, req.user.userId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update an account' })
    update(
        @Request() req: RequestWithUser,
        @Param('id') id: string,
        @Body() updateAccountDto: UpdateAccountDto,
    ) {
        return this.updateAccountUseCase.execute(id, req.user.userId, updateAccountDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Inactivates or deletes an account' })
    remove(@Request() req: RequestWithUser, @Param('id') id: string) {
        return this.inactivateAccountUseCase.execute(id, req.user.userId);
    }
}
