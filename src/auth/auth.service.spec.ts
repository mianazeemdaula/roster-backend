import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByEmailOrPhone: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    updateLastLogin: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create a new user and return token', async () => {
      const registerDto = {
        name: 'Test User',
        phone: '1234567890',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUsersService.findByEmailOrPhone.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({
        id: 1,
        ...registerDto,
        password: 'hashed',
      });
      mockJwtService.sign.mockReturnValue('token');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('access_token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw ConflictException if user exists', async () => {
      mockUsersService.findByEmailOrPhone.mockResolvedValue({ id: 1 });

      await expect(
        service.register({
          name: 'Test',
          phone: '123',
          password: 'pass',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login user and return token', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = {
        id: 1,
        email: 'test@example.com',
        password: hashedPassword,
        isActive: true,
      };

      mockUsersService.findByEmailOrPhone.mockResolvedValue(user);
      mockUsersService.updateLastLogin.mockResolvedValue(undefined);
      mockJwtService.sign.mockReturnValue('token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token');
      expect(mockUsersService.updateLastLogin).toHaveBeenCalledWith(1);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockUsersService.findByEmailOrPhone.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrong',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
