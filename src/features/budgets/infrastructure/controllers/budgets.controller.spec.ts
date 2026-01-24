import { Test, TestingModule } from '@nestjs/testing';
import { BudgetsController } from './budgets.controller';
import { CreateBudgetUseCase } from '../../application/use-cases/create-budget.use-case';
import { GetBudgetsUseCase } from '../../application/use-cases/get-budgets.use-case';
import { GetBudgetByIdUseCase } from '../../application/use-cases/get-budget-by-id.use-case';
import { GetBudgetStatusUseCase } from '../../application/use-cases/get-budget-status.use-case';
import { UpdateBudgetUseCase } from '../../application/use-cases/update-budget.use-case';
import { DeleteBudgetUseCase } from '../../application/use-cases/delete-budget.use-case';
import { CreateBudgetDto } from '../../application/dto';
import { BudgetPeriod } from '../../domain/enums/budget-period.enum';

describe('BudgetsController', () => {
    let controller: BudgetsController;
    let createBudgetUseCase: any;
    let getBudgetsUseCase: any;
    let getBudgetByIdUseCase: any;
    let getBudgetStatusUseCase: any;
    let updateBudgetUseCase: any;
    let deleteBudgetUseCase: any;

    beforeEach(async () => {
        createBudgetUseCase = { execute: jest.fn() };
        getBudgetsUseCase = { execute: jest.fn() };
        getBudgetByIdUseCase = { execute: jest.fn() };
        getBudgetStatusUseCase = { execute: jest.fn() };
        updateBudgetUseCase = { execute: jest.fn() };
        deleteBudgetUseCase = { execute: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [BudgetsController],
            providers: [
                { provide: CreateBudgetUseCase, useValue: createBudgetUseCase },
                { provide: GetBudgetsUseCase, useValue: getBudgetsUseCase },
                { provide: GetBudgetByIdUseCase, useValue: getBudgetByIdUseCase },
                { provide: GetBudgetStatusUseCase, useValue: getBudgetStatusUseCase },
                { provide: UpdateBudgetUseCase, useValue: updateBudgetUseCase },
                { provide: DeleteBudgetUseCase, useValue: deleteBudgetUseCase },
            ],
        }).compile();

        controller = module.get<BudgetsController>(BudgetsController);
    });

    describe('create', () => {
        it('should create a budget', async () => {
            const dto: CreateBudgetDto = {
                categoryId: 'cat-123',
                amount: 500,
                period: BudgetPeriod.MONTHLY,
            };
            const req = { user: { userId: 'user-123' } } as any;
            const expectedResult = { id: 'budget-123', ...dto };

            createBudgetUseCase.execute.mockResolvedValue(expectedResult);

            const result = await controller.create(req, dto);

            expect(result).toBe(expectedResult);
            expect(createBudgetUseCase.execute).toHaveBeenCalledWith({
                userId: 'user-123',
                ...dto,
            });
        });
    });

    describe('findAll', () => {
        it('should return all budgets', async () => {
            const req = { user: { userId: 'user-123' } } as any;
            const expectedResult = [{ id: 'budget-123' }];

            getBudgetsUseCase.execute.mockResolvedValue(expectedResult);

            const result = await controller.findAll(req);

            expect(result).toBe(expectedResult);
            expect(getBudgetsUseCase.execute).toHaveBeenCalledWith({
                userId: 'user-123',
                activeOnly: false,
            });
        });
    });

    describe('getStatus', () => {
        it('should return budget status', async () => {
            const req = { user: { userId: 'user-123' } } as any;
            const expectedResult = { budgetId: 'budget-123', percentageUsed: 50 };

            getBudgetStatusUseCase.execute.mockResolvedValue(expectedResult);

            const result = await controller.getStatus(req, 'budget-123');

            expect(result).toBe(expectedResult);
            expect(getBudgetStatusUseCase.execute).toHaveBeenCalledWith({
                id: 'budget-123',
                userId: 'user-123',
            });
        });
    });
});
