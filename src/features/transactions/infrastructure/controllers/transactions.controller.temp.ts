import { Body, Post, Request } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategorizeTransactionUseCase } from '../../application/use-cases/categorize-transaction.use-case';

interface RequestWithUser extends Request {
    user: {
        userId: string;
        email: string;
    };
}

export class TempController {
    constructor(private readonly categorizeTransactionUseCase: CategorizeTransactionUseCase) { }

    @Post('suggest-category')
    @ApiOperation({ summary: 'Suggest category for a transaction using AI' })
    @ApiResponse({ status: 200, description: 'Category suggestion' })
    async suggestCategory(
        @Request() req: RequestWithUser,
        @Body() body: { description: string; amount: number },
    ) {
        return this.categorizeTransactionUseCase.execute({
            userId: req.user.userId,
            description: body.description,
            amount: body.amount,
        });
    }
}
