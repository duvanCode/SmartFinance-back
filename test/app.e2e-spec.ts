import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/infrastructure/prisma/prisma.service';

describe('SmartFinance API (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    // Test data
    let authToken: string;
    let testUserId: string;
    let testCategoryId: string;
    let testTransactionId: string;
    let testBudgetId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        // Apply same configuration as main.ts
        app.setGlobalPrefix('api/v1', {
            exclude: ['health', 'health/live', 'health/ready'],
        });
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );

        await app.init();
        prisma = app.get(PrismaService);

        // Create test user directly in database
        const testUser = await prisma.user.create({
            data: {
                email: 'e2e-test@smartfinance.com',
                name: 'E2E Test User',
                googleId: 'e2e-test-google-id-' + Date.now(),
            },
        });
        testUserId = testUser.id;

        // Generate a mock JWT token for testing
        // In a real scenario, you would use the auth service to generate this
        const jwt = app.get('JwtService');
        authToken = jwt.sign({ userId: testUserId, email: testUser.email });
    });

    afterAll(async () => {
        // Clean up test data
        if (testUserId) {
            await prisma.user.delete({ where: { id: testUserId } }).catch(() => { });
        }
        await app.close();
    });

    describe('Health Checks', () => {
        it('/health (GET) - should return health status', () => {
            return request(app.getHttpServer())
                .get('/health')
                .expect(200)
                .expect((res) => {
                    expect(res.body.status).toBe('ok');
                });
        });

        it('/health/live (GET) - should return liveness status', () => {
            return request(app.getHttpServer())
                .get('/health/live')
                .expect(200)
                .expect((res) => {
                    expect(res.body.status).toBe('ok');
                });
        });

        it('/health/ready (GET) - should return readiness status', () => {
            return request(app.getHttpServer())
                .get('/health/ready')
                .expect(200)
                .expect((res) => {
                    expect(res.body.status).toBe('ok');
                });
        });
    });

    describe('Categories Flow', () => {
        it('/api/v1/categories (POST) - should create a category', () => {
            return request(app.getHttpServer())
                .post('/api/v1/categories')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'E2E Test Category',
                    type: 'EXPENSE',
                    color: '#FF5733',
                    icon: 'shopping-cart',
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body.id).toBeDefined();
                    expect(res.body.name).toBe('E2E Test Category');
                    testCategoryId = res.body.id;
                });
        });

        it('/api/v1/categories (GET) - should get user categories', () => {
            return request(app.getHttpServer())
                .get('/api/v1/categories')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBe(true);
                    expect(res.body.length).toBeGreaterThan(0);
                });
        });
    });

    describe('Transactions Flow', () => {
        it('/api/v1/transactions (POST) - should create a transaction', () => {
            return request(app.getHttpServer())
                .post('/api/v1/transactions')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    categoryId: testCategoryId,
                    amount: 150.50,
                    type: 'EXPENSE',
                    description: 'E2E Test Transaction',
                    date: new Date().toISOString(),
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body.id).toBeDefined();
                    expect(res.body.amount).toBe(150.5);
                    testTransactionId = res.body.id;
                });
        });

        it('/api/v1/transactions (GET) - should get user transactions', () => {
            return request(app.getHttpServer())
                .get('/api/v1/transactions')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBe(true);
                });
        });

        it('/api/v1/transactions/:id (GET) - should get transaction by id', () => {
            return request(app.getHttpServer())
                .get(`/api/v1/transactions/${testTransactionId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.id).toBe(testTransactionId);
                });
        });

        it('/api/v1/transactions/stats (GET) - should get transaction stats', () => {
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1);
            const endDate = new Date();

            return request(app.getHttpServer())
                .get('/api/v1/transactions/stats')
                .query({
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                })
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.totalIncome).toBeDefined();
                    expect(res.body.totalExpenses).toBeDefined();
                });
        });
    });

    describe('Budgets Flow', () => {
        it('/api/v1/budgets (POST) - should create a budget', () => {
            return request(app.getHttpServer())
                .post('/api/v1/budgets')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    categoryId: testCategoryId,
                    amount: 500.00,
                    period: 'MONTHLY',
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body.id).toBeDefined();
                    expect(res.body.amount).toBe(500);
                    testBudgetId = res.body.id;
                });
        });

        it('/api/v1/budgets (GET) - should get user budgets', () => {
            return request(app.getHttpServer())
                .get('/api/v1/budgets')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBe(true);
                });
        });

        it('/api/v1/budgets/:id/status (GET) - should get budget status', () => {
            return request(app.getHttpServer())
                .get(`/api/v1/budgets/${testBudgetId}/status`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.budgetAmount).toBeDefined();
                    expect(res.body.spentAmount).toBeDefined();
                    expect(res.body.percentageUsed).toBeDefined();
                });
        });
    });

    describe('Analytics Flow', () => {
        it('/api/v1/analytics/spending-by-category (GET) - should get spending by category', () => {
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1);
            const endDate = new Date();

            return request(app.getHttpServer())
                .get('/api/v1/analytics/spending-by-category')
                .query({
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                })
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBe(true);
                });
        });

        it('/api/v1/analytics/income-vs-expenses (GET) - should get income vs expenses', () => {
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1);
            const endDate = new Date();

            return request(app.getHttpServer())
                .get('/api/v1/analytics/income-vs-expenses')
                .query({
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                })
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.totalIncome).toBeDefined();
                    expect(res.body.totalExpenses).toBeDefined();
                });
        });
    });

    describe('Error Handling', () => {
        it('should return 401 for unauthenticated requests', () => {
            return request(app.getHttpServer())
                .get('/api/v1/categories')
                .expect(401);
        });

        it('should return 400 for invalid input', () => {
            return request(app.getHttpServer())
                .post('/api/v1/categories')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: '', // Invalid: empty name
                    type: 'INVALID_TYPE',
                })
                .expect(400);
        });

        it('should return 404 for non-existent resource', () => {
            return request(app.getHttpServer())
                .get('/api/v1/transactions/non-existent-id')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });
    });

    describe('Cleanup', () => {
        it('should delete the test budget', async () => {
            if (!testBudgetId) return;
            await request(app.getHttpServer())
                .delete(`/api/v1/budgets/${testBudgetId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(204);
        });

        it('should delete the test transaction', async () => {
            if (!testTransactionId) return;
            await request(app.getHttpServer())
                .delete(`/api/v1/transactions/${testTransactionId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(204);
        });

        it('should delete the test category', async () => {
            if (!testCategoryId) return;
            await request(app.getHttpServer())
                .delete(`/api/v1/categories/${testCategoryId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(204);
        });
    });
});
