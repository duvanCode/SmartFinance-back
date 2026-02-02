import { Test, TestingModule } from '@nestjs/testing';
import { GetDashboardSummaryUseCase } from './get-dashboard-summary.use-case';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { TransactionType, LoanType, LoanStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

describe('GetDashboardSummaryUseCase', () => {
    let useCase: GetDashboardSummaryUseCase;
    let prismaService: PrismaService;

    const mockPrismaService = {
        transaction: {
            aggregate: jest.fn(),
            groupBy: jest.fn(),
        },
        loan: {
            aggregate: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetDashboardSummaryUseCase,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        useCase = module.get<GetDashboardSummaryUseCase>(GetDashboardSummaryUseCase);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should calculate realBalance correctly by subtracting expenses from income', async () => {
        const userId = 'user-1';

        // Mock aggregate to return specific values based on the query
        mockPrismaService.transaction.aggregate.mockImplementation((args) => {
            const where = args.where;

            // Real Balance Income (no isLoan filter)
            if (where.type === TransactionType.INCOME && where.isLoan === undefined) {
                return { _sum: { amount: new Decimal(1000) } };
            }

            // Real Balance Expense (no isLoan filter)
            if (where.type === TransactionType.EXPENSE && where.isLoan === undefined) {
                return { _sum: { amount: new Decimal(300) } };
            }

            // Default for others (Operational Balance, Loans)
            return { _sum: { amount: new Decimal(0) } };
        });

        mockPrismaService.loan.aggregate.mockResolvedValue({
            _sum: { pendingAmount: new Decimal(0) },
        });

        const result = await useCase.execute(userId);

        // Expected: 1000 - 300 = 700
        expect(result.realBalance).toBe(700);

        // Verify aggregate was called for both types without isLoan filter
        expect(mockPrismaService.transaction.aggregate).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { userId, type: TransactionType.INCOME },
                _sum: { amount: true },
            })
        );
        expect(mockPrismaService.transaction.aggregate).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { userId, type: TransactionType.EXPENSE },
                _sum: { amount: true },
            })
        );
    });
});
