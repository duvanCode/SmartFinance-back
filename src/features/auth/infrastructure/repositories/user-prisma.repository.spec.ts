import { Test, TestingModule } from '@nestjs/testing';
import { UserPrismaRepository } from './user-prisma.repository';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { User } from '../../domain/entities/user.entity';

describe('UserPrismaRepository', () => {
  let repository: UserPrismaRepository;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPrismaRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get<UserPrismaRepository>(UserPrismaRepository);
    prisma = module.get(PrismaService);
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        name: 'John Doe',
        googleId: 'google-123',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.findById('test-id');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe('test-id');
    });

    it('should return null when user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      const user = User.create('test@example.com', 'John Doe', 'google-123');
      const mockCreated = {
        ...user.toPersistence(),
      };

      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreated);

      const result = await repository.create(user);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: user.toPersistence(),
      });
      expect(result).toBeInstanceOf(User);
    });
  });
});
