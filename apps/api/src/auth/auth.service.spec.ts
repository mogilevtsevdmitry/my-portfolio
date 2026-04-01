import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;

  const mockUser = {
    id: 'user-1',
    email: 'admin@example.com',
    password: bcrypt.hashSync('password123', 10),
    refreshTokenHash: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mock_token'), verify: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                REFRESH_TOKEN_SECRET: 'test_refresh_secret',
                JWT_SECRET: 'test_jwt_secret',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  describe('validateUser', () => {
    it('should return user without password on valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser(
        'admin@example.com',
        'password123',
      );

      expect(result).toBeDefined();
      expect(result?.id).toBe('user-1');
      expect(result).not.toHaveProperty('password');
    });

    it('should return null on invalid password', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser(
        'admin@example.com',
        'wrong_password',
      );

      expect(result).toBeNull();
    });

    it('should return null when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('nobody@example.com', 'pass');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens', async () => {
      prisma.user.update.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('signed_token');

      const result = await service.login({ id: 'user-1', email: 'admin@example.com' });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });
});
