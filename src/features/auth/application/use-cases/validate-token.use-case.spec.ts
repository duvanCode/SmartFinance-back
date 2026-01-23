import { UnauthorizedException } from '@nestjs/common';
import { ValidateTokenUseCase } from './validate-token.use-case';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { ITokenGenerator } from '../ports/token-generator.interface';
import { User } from '../../domain/entities/user.entity';

describe('ValidateTokenUseCase', () => {
  let useCase: ValidateTokenUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let tokenGenerator: jest.Mocked<ITokenGenerator>;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByGoogleId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    tokenGenerator = {
      generate: jest.fn(),
      verify: jest.fn(),
    };

    useCase = new ValidateTokenUseCase(userRepository, tokenGenerator);
  });

  it('should validate token and return user', async () => {
    const user = User.create('test@example.com', 'John Doe', 'google-123');
    const payload = { userId: user.id, email: 'test@example.com' };

    tokenGenerator.verify.mockReturnValue(payload);
    userRepository.findById.mockResolvedValue(user);

    const result = await useCase.execute({ token: 'valid-jwt' });

    expect(tokenGenerator.verify).toHaveBeenCalledWith('valid-jwt');
    expect(userRepository.findById).toHaveBeenCalledWith(user.id);
    expect(result.user).toBe(user);
  });

  it('should throw UnauthorizedException for invalid token', async () => {
    tokenGenerator.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await expect(useCase.execute({ token: 'invalid-jwt' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when user not found', async () => {
    const payload = { userId: 'non-existent-id', email: 'test@example.com' };

    tokenGenerator.verify.mockReturnValue(payload);
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ token: 'valid-jwt' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
