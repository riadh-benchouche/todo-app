import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  ForbiddenException,
  Request,
  BadRequestException,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from './roles.enum';
import { plainToInstance } from 'class-transformer';
import { AuthUser } from './user.types';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * @title Create a user
   * @description Create a new user in the database
   * @param createUserDto
   * @returns User
   * @throws ForbiddenException
   * @throws NotFoundException
   * @throws UnauthorizedException
   */
  @Roles(Role.ADMIN)
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  /**
   * @title Find all users
   * @description Find all users in the database with pagination
   * @returns { data: User[]; total: number }
   * @throws ForbiddenException
   * @throws BadRequestException
   * @param paginationDto
   */
  @Roles(Role.ADMIN)
  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<{ data: User[]; total: number }> {
    const { limit, offset } = paginationDto;
    const users = await this.usersService.findAll(
      Number(limit),
      Number(offset),
    );
    return {
      data: plainToInstance(User, users.data),
      total: users.total,
    };
  }

  /**
   * @title Find a user
   * @description Find a user by id
   * @param id
   * @returns User
   * @throws NotFoundException
   * @throws ForbiddenException
   * @throws BadRequestException
   */
  @Roles(Role.ADMIN)
  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<User> {
    return plainToInstance(User, await this.usersService.findOne(id));
  }

  /**
   * @title Update a user
   * @description Update a user by id
   * @param id
   * @param updateUserDto
   * @param req
   * @throws NotFoundException
   * @throws ForbiddenException
   * @throws BadRequestException
   */
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: { user: AuthUser },
  ): Promise<User> {
    const authUser = req.user;
    return this.usersService.update(id, updateUserDto, authUser);
  }

  /**
   * @title Remove a user
   * @description Remove a user by id from the database (soft delete)
   * @param id
   * @throws NotFoundException
   * @throws ForbiddenException
   * @throws BadRequestException
   */
  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
