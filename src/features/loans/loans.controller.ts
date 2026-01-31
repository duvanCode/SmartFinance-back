import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { RegisterPaymentDto } from './dto/register-payment.dto';
import { JwtAuthGuard } from '../../features/auth/infrastructure/guards/jwt-auth.guard'; // Adjust path if needed

interface RequestWithUser extends Request {
    user: {
        userId: string;
        email: string;
    };
}

@Controller('loans')
@UseGuards(JwtAuthGuard)
export class LoansController {
    constructor(private readonly loansService: LoansService) { }

    @Post()
    create(@Request() req: RequestWithUser, @Body() createLoanDto: CreateLoanDto) {
        return this.loansService.create(req.user.userId, createLoanDto);
    }

    @Get()
    findAll(@Request() req: RequestWithUser) {
        return this.loansService.findAll(req.user.userId);
    }

    @Get(':id')
    findOne(@Request() req: RequestWithUser, @Param('id') id: string) {
        return this.loansService.findOne(req.user.userId, id);
    }

    @Post(':id/finalize')
    finalize(@Request() req: RequestWithUser, @Param('id') id: string) {
        return this.loansService.finalize(req.user.userId, id);
    }
}
