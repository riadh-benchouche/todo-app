import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (user) {
      throw new ConflictException('User already exists');
    }
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);

    const newUser = this.userRepository.create(createUserDto);
    return this.userRepository.save(newUser);
  }

  async findAll(limit = 10, offset = 0): Promise<User[]> {
    return this.userRepository.find({
      skip: offset,
      take: limit,
    });
  }

  async findOne(id: string): Promise<User> {
    return this.findUserById(id);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findUserById(id);
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    await this.userRepository.update(id, updateUserDto);
    return this.userRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.findUserById(id);
    await this.userRepository.softDelete(id);
  }

  private async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
