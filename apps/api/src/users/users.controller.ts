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

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.ADMIN)
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Roles(Role.ADMIN)
  @Get()
  async findAll(): Promise<User[]> {
    return plainToInstance(User, await this.usersService.findAll());
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return plainToInstance(User, await this.usersService.findOne(id));
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: { user: { userId: string; email: string } },
  ): Promise<User> {
    const user = req.user;

    if (user.userId !== id) {
      throw new ForbiddenException('You cannot update another user');
    }

    if (updateUserDto.email) {
      throw new BadRequestException('Email cannot be modified');
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.usersService.remove(id);
    return Promise.resolve();
  }
}
