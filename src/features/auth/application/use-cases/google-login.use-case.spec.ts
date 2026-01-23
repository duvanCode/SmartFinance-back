import { GoogleLoginUseCase } from './google-login.use-case';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { IOAuthProvider } from '../ports/oauth-provider.interface';
import { ITokenGenerator } from '../ports/token-generator.interface';
import { User } from '../../domain/entities/user.entity';

describe('GoogleLoginUseCase', () => {
  let useCase: GoogleLoginUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let oauthProvider: jest.Mocked<IOAuthProvider>;
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

    oauthProvider = {
      validateToken: jest.fn(),
    };

    tokenGenerator = {
      generate: jest.fn(),
      verify: jest.fn(),
    };

    useCase = new GoogleLoginUseCase(
      userRepository,
      oauthProvider,
      tokenGenerator,
    );
  });

  describe('Login with existing user', () => {
    it('should login existing user successfully', async () => {
      const googleUserInfo = {
        id: 'google-123',
        email: 'test@example.com',
        name: 'John Doe',
        picture: 'https://avatar.url',
      };

      const existingUser = User.create(
        'test@example.com',
        'John Doe',
        'google-123',
        'https://avatar.url',
      );

      oauthProvider.validateToken.mockResolvedValue(googleUserInfo);
      userRepository.findByGoogleId.mockResolvedValue(existingUser);
      tokenGenerator.generate.mockReturnValue('jwt-token-123');

      const result = await useCase.execute({ token: 'google-token' });

      expect(oauthProvider.validateToken).toHaveBeenCalledWith('google-token');
      expect(userRepository.findByGoogleId).toHaveBeenCalledWith('google-123');
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(tokenGenerator.generate).toHaveBeenCalledWith({
        userId: existingUser.id,
        email: 'test@example.com',
      });
      expect(result.accessToken).toBe('jwt-token-123');
      expect(result.user.email).toBe('test@example.com');
    });
  });

  describe('Login with new user', () => {
    it('should create new user and login', async () => {
      const googleUserInfo = {
        id: 'google-456',
        email: 'newuser@example.com',
        name: 'Jane Doe',
        picture: 'https://new-avatar.url',
      };

      const newUser = User.create(
        'newuser@example.com',
        'Jane Doe',
        'google-456',
        'https://new-avatar.url',
      );

      oauthProvider.validateToken.mockResolvedValue(googleUserInfo);
      userRepository.findByGoogleId.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(newUser);
      tokenGenerator.generate.mockReturnValue('jwt-token-456');

      const result = await useCase.execute({ token: 'google-token' });

      expect(userRepository.findByGoogleId).toHaveBeenCalledWith('google-456');
      expect(userRepository.create).toHaveBeenCalled();
      expect(result.accessToken).toBe('jwt-token-456');
      expect(result.user.email).toBe('newuser@example.com');
    });
  });

  describe('Error handling', () => {
    it('should throw error when Google token is invalid', async () => {
      oauthProvider.validateToken.mockRejectedValue(
        new Error('Invalid Google token'),
      );

      await expect(useCase.execute({ token: 'invalid-token' })).rejects.toThrow(
        'Invalid Google token',
      );
    });

    it('should throw error when user creation fails', async () => {
      const googleUserInfo = {
        id: 'google-789',
        email: 'fail@example.com',
        name: 'Fail User',
      };

      oauthProvider.validateToken.mockResolvedValue(googleUserInfo);
      userRepository.findByGoogleId.mockResolvedValue(null);
      userRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute({ token: 'google-token' })).rejects.toThrow(
        'Database error',
      );
    });
  });
});
