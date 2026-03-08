import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../auth/infrastructure/guards/jwt-auth.guard';
import { CreateLoanDto } from '../dto/create-loan.dto';
import { UpdateLoanDto } from '../dto/update-loan.dto';

import { CreateLoanUseCase } from '../../../application/use-cases/create-loan.use-case';
import { GetLoansUseCase } from '../../../application/use-cases/get-loans.use-case';
import { GetLoanByIdUseCase } from '../../../application/use-cases/get-loan-by-id.use-case';
import { UpdateLoanUseCase } from '../../../application/use-cases/update-loan.use-case';
import { FinalizeLoanUseCase } from '../../../application/use-cases/finalize-loan.use-case';
import { DeleteLoanUseCase } from '../../../application/use-cases/delete-loan.use-case';

interface RequestWithUser extends Request {
    user: {
        userId: string;
        email: string;
    };
}

@Controller('loans')
@UseGuards(JwtAuthGuard)
export class LoansController {
    constructor(
        private readonly createLoanUseCase: CreateLoanUseCase,
        private readonly getLoansUseCase: GetLoansUseCase,
        private readonly getLoanByIdUseCase: GetLoanByIdUseCase,
        private readonly updateLoanUseCase: UpdateLoanUseCase,
        private readonly finalizeLoanUseCase: FinalizeLoanUseCase,
        private readonly deleteLoanUseCase: DeleteLoanUseCase,
    ) { }

    @Post()
    async create(@Request() req: RequestWithUser, @Body() createLoanDto: CreateLoanDto) {
        return this.createLoanUseCase.execute({
            userId: req.user.userId,
            dto: createLoanDto
        });
    }

    @Get()
    async findAll(@Request() req: RequestWithUser) {
        return this.getLoansUseCase.execute(req.user.userId);
    }

    @Get(':id')
    async findOne(@Request() req: RequestWithUser, @Param('id') id: string) {
         return this.getLoanByIdUseCase.execute({
             userId: req.user.userId,
             id
         });
    }

    @Post(':id/finalize')
    @HttpCode(HttpStatus.OK)
    async finalize(@Request() req: RequestWithUser, @Param('id') id: string) {
        await this.finalizeLoanUseCase.execute({
            userId: req.user.userId,
            id
        });
        return { success: true };
    }

    @Put(':id')
    async update(
        @Request() req: RequestWithUser,
        @Param('id') id: string,
        @Body() updateLoanDto: UpdateLoanDto
    ) {
         return this.updateLoanUseCase.execute({
             userId: req.user.userId,
             id,
             dto: updateLoanDto
         });
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Request() req: RequestWithUser, @Param('id') id: string) {
        return this.deleteLoanUseCase.execute({
            userId: req.user.userId,
            id
        });
    }
}
