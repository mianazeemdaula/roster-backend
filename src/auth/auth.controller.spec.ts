import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        name: 'Test User',
        phone: '1234567890',
        email: 'test@example.com',
        password: 'password123',
      };

      const result = {
        user: { id: 1, ...registerDto },
        access_token: 'token',
      };

      mockAuthService.register.mockResolvedValue(result);

      expect(await controller.register(registerDto)).toBe(result);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should login user', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = {
        user: { id: 1, email: loginDto.email },
        access_token: 'token',
      };

      mockAuthService.login.mockResolvedValue(result);

      expect(await controller.login(loginDto)).toBe(result);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const req = { user: { userId: 1 } };
      const userProfile = { id: 1, name: 'Test User' };

      mockAuthService.validateUser.mockResolvedValue(userProfile);

      expect(await controller.getProfile(req)).toBe(userProfile);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(1);
    });
  });
});
