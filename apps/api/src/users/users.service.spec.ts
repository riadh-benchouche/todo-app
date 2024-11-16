import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { jest, describe, it, beforeEach, expect } from '@jest/globals';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const mockUserRepository = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users and total count', async () => {
      const users = [new User()];
      (userRepository.findAndCount as jest.Mock).mockResolvedValue([
        users,
        1,
      ] as never);

      const result = await service.findAll(10, 0);
      expect(result).toEqual({ data: users, total: 1 });
      expect(userRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const user = new User();
      (userRepository.findOne as jest.Mock).mockResolvedValue(user as never);

      expect(await service.findOne('1')).toEqual(user);
    });

    it('should throw NotFoundException if user is not found', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null as never);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a user', async () => {
      const createUserDto = { email: 'test@example.com', password: 'password' };
      (userRepository.findOne as jest.Mock).mockResolvedValue(null as never);
      (userRepository.create as jest.Mock).mockReturnValue(createUserDto);
      (userRepository.save as jest.Mock).mockResolvedValue(
        createUserDto as never,
      );

      const result = await service.create(createUserDto as any);
      expect(result).toEqual(createUserDto);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already exists', async () => {
      const createUserDto = { email: 'test@example.com', password: 'password' };
      (userRepository.findOne as jest.Mock).mockResolvedValue(
        new User() as never,
      );

      await expect(service.create(createUserDto as any)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should call softDelete on the repository', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(
        new User() as never,
      );
      (userRepository.softDelete as jest.Mock).mockResolvedValue(
        undefined as never,
      );

      await service.remove('1');
      expect(userRepository.softDelete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if user is not found', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null as never);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
