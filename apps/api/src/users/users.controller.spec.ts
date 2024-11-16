import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Role } from './roles.enum';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const mockUsersService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = { data: [], total: 0 };
      jest.spyOn(service, 'findAll').mockResolvedValue(result);
      const paginationDto = { limit: 10, offset: 0 };

      expect(await controller.findAll(paginationDto)).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const user: User = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        password: undefined,
        role: Role.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(user);

      expect(await controller.findOne('1')).toEqual(user);
    });
  });

  describe('create', () => {
    it('should create and return a user', async () => {
      const newUser: User = {
        id: '1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'hashed',
        role: Role.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      jest.spyOn(service, 'create').mockResolvedValue(newUser);

      expect(await controller.create(newUser)).toEqual(newUser);
    });
  });

  describe('update', () => {
    it('should update and return a user', async () => {
      const updatedUser: User = {
        id: '1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'hashed',
        role: Role.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      jest.spyOn(service, 'update').mockResolvedValue(updatedUser);

      expect(
        await controller.update('1', updatedUser, {
          user: { userId: '1', role: Role.USER, email: 'jane@example.com' },
        }),
      ).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should call remove method', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue();

      await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});
