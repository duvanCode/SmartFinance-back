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
