import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      signup: jest.fn(),
      login: jest.fn(),
    };

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

  describe('signup', () => {
    it('should call AuthService.signup with correct data', async () => {
      const signupDto: SignupDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'testuser',
      };
      const mockResponse = {
        message: 'User signed up successfully',
        userId: '1',
      };

      jest.spyOn(authService, 'signup').mockResolvedValue(mockResponse);

      const result = await controller.signup(signupDto);

      expect(authService.signup).toHaveBeenCalledWith(signupDto);
      expect(result).toEqual(mockResponse);
    });

    it('should throw BadRequestException if AuthService.signup throws', async () => {
      const signupDto: SignupDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'testuser',
      };

      jest
        .spyOn(authService, 'signup')
        .mockRejectedValue(new BadRequestException());

      await expect(controller.signup(signupDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should call AuthService.login with correct data', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResponse = {
        message: 'User logged in successfully',
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
        },
        token: 'jwt-token',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(mockResponse);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockResponse);
    });

    it('should throw BadRequestException if AuthService.login throws', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new BadRequestException());

      await expect(controller.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
