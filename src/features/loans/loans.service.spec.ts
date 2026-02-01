import { Test, TestingModule } from '@nestjs/testing';
import { LoansService } from './loans.service';
import { LoansRepository } from './loans.repository';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { LoanType, LoanStatus, CategoryType } from '@prisma/client';

describe('LoansService', () => {
    let service: LoansService;
    let prismaService: PrismaService;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let repository: LoansRepository;

    const mockPrismaService = {
        $transaction: jest.fn((callback) => callback(mockTx)),
        loan: {
            update: jest.fn(),
        },
        transaction: {
            findMany: jest.fn(),
        }
    };

    const mockTx = {
        category: {
            create: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
        },
        loan: {
            create: jest.fn(),
            findMany: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
        },
        transaction: {
            create: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
        }
    };

    const mockRepository = {
        findAll: jest.fn(),
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LoansService,
                {
                    provide: LoansRepository,
                    useValue: mockRepository,
                },
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<LoansService>(LoansService);
        repository = module.get<LoansRepository>(LoansRepository);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const userId = 'user-123';
        const createLoanDto: CreateLoanDto = {
            name: 'Test Loan',
            initialAmount: 1000,
            type: LoanType.RECEIVED,
            startDate: '2023-01-01T00:00:00.000Z',
            notes: 'Test notes',
        };

        const mockLoan = {
            id: 'loan-1',
            ...createLoanDto,
            userId,
            status: LoanStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        it('should create a loan with an existing categoryId', async () => {
            const dtoWithCategory = { ...createLoanDto, categoryId: 'cat-123' };

            mockTx.loan.create.mockResolvedValue(mockLoan);
            mockTx.transaction.create.mockResolvedValue({ id: 'tx-1' });

            // Mock findFirst for existing active loan check
            mockTx.loan.findFirst.mockResolvedValue(null);

            const result = await service.create(userId, dtoWithCategory);

            expect(mockPrismaService.$transaction).toHaveBeenCalled();
            expect(mockTx.category.create).not.toHaveBeenCalled(); // Should NOT create category
            expect(mockTx.loan.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    userId,
                    categoryId: 'cat-123',
                })
            }));
            expect(result).toEqual(mockLoan);
        });

        it('should create a new category and assign it when categoryId is missing', async () => {
            const newCategory = { id: 'new-cat-id', name: createLoanDto.name };

            mockTx.category.create.mockResolvedValue(newCategory);
            mockTx.loan.create.mockResolvedValue({ ...mockLoan, categoryId: newCategory.id });
            mockTx.transaction.create.mockResolvedValue({ id: 'tx-1' });

            // Mock findFirst for existing active loan check
            mockTx.loan.findFirst.mockResolvedValue(null);

            const result = await service.create(userId, createLoanDto);

            expect(mockPrismaService.$transaction).toHaveBeenCalled();

            // Verify category creation
            expect(mockTx.category.create).toHaveBeenCalledWith({
                data: {
                    userId,
                    name: createLoanDto.name, // Should use loan name
                    type: CategoryType.EXPENSE,
                    color: '#607D8B',
                    icon: 'bank',
                }
            });

            // Verify loan creation uses new category ID
            expect(mockTx.loan.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    userId,
                    categoryId: newCategory.id,
                })
            }));

            expect(result.categoryId).toBe(newCategory.id);
        });
    });

    describe('update', () => {
        const userId = 'user-123';
        const loanId = 'loan-1';
        const mockLoan = {
            id: loanId,
            userId,
            categoryId: 'cat-1',
            type: LoanType.RECEIVED,
            initialAmount: 1000,
            name: 'Original Loan',
        };

        it('should update category type when loan type changes from RECEIVED to GIVEN', async () => {
            const updateDto = { type: LoanType.GIVEN };

            mockRepository.findOne.mockResolvedValue(mockLoan);
            mockTx.loan.findFirst.mockResolvedValue(null); // No other loan using category
            mockTx.category.update.mockResolvedValue({});
            mockTx.loan.update.mockResolvedValue({ ...mockLoan, ...updateDto });
            mockTx.transaction.findFirst.mockResolvedValue(null);

            await service.update(userId, loanId, updateDto);

            expect(mockTx.category.update).toHaveBeenCalledWith({
                where: { id: mockLoan.categoryId },
                data: { type: CategoryType.INCOME } // GIVEN -> INCOME
            });

            expect(mockTx.loan.update).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ type: LoanType.GIVEN })
            }));
        });
    });
});
