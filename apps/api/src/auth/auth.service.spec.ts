import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { User } from '../users/user.entity';

jest.mock('bcrypt', () => {
  const actualBcrypt = jest.requireActual('bcrypt');
  return {
    // @ts-ignore
    ...actualBcrypt,
    compare: jest.fn(),
  };
});

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const mockUsersService = {
      findOneByEmail: jest.fn(),
      create: jest.fn(),
    };
    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should throw BadRequestException if user already exists', async () => {
      const signupDto: SignupDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'testuser',
      };
      const mockUser = {
        id: '1',
        name: 'Existing User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValue(mockUser as User); // Simule un utilisateur existant

      await expect(service.signup(signupDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create a new user if user does not exist', async () => {
      const signupDto: SignupDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'testuser',
      };
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null); // Simule un utilisateur non existant
      jest.spyOn(usersService, 'create').mockResolvedValue({
        id: '1',
        name: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User);

      const result = await service.signup(signupDto);

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@example.com' }),
      );
      expect(result).toEqual({
        message: 'User signed up successfully',
        userId: '1',
      });
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if password is incorrect', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      const user = {
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValue(user as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return a token if credentials are correct', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const user = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
      };
      const token = 'jwt-token';

      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValue(user as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true as never);
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const result = await service.login(loginDto);

      expect(jwtService.sign).toHaveBeenCalledWith({
        userId: user.id,
        email: user.email,
      });
      expect(result).toEqual({
        message: 'User logged in successfully',
        user: { id: user.id, email: user.email, name: user.name },
        token,
      });
    });
  });
});
