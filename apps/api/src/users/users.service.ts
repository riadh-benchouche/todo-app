import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthUser } from './user.types';
import { Role } from './roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * @title Find all users
   * @description Find all users in the database with pagination
   * @returns { data: User[]; total: number }
   * @param limit
   * @param offset
   */
  async findAll(
    limit = 10,
    offset = 0,
  ): Promise<{ data: User[]; total: number }> {
    const [data, total] = await this.userRepository.findAndCount({
      skip: offset,
      take: limit,
    });
    return { data, total };
  }

  /**
   * @title Create a user
   * @description Create a new user in the database
   * @param createUserDto
   * @returns User
   * @throws ConflictException
   */
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

  /**
   * @title Find a user
   * @description Find a user by ID
   * @returns User
   * @param id
   */
  async findOne(id: string): Promise<User> {
    return this.findUserById(id);
  }

  /**
   * @title Update a user
   * @description Update a user by ID
   * @param id
   * @param updateUserDto
   * @param authUser
   * @returns User
   * @throws ForbiddenException
   * @throws BadRequestException
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    authUser: AuthUser,
  ): Promise<User> {
    // Vérifie si l'utilisateur connecté essaie de modifier un autre utilisateur
    if (authUser.userId !== id && authUser.role !== Role.ADMIN) {
      throw new ForbiddenException('You cannot update another user');
    }

    // Charge l'utilisateur existant
    const user = await this.findUserById(id);

    // Vérifie si le champ `email` est modifié
    if (updateUserDto.email) {
      throw new BadRequestException('Email cannot be modified');
    }

    // Vérifie si les champs `role` ou `isActive` sont modifiés
    if (
      (updateUserDto.role || updateUserDto.isActive !== undefined) &&
      authUser.role !== Role.ADMIN
    ) {
      throw new ForbiddenException(
        'Only admins can change role or isActive status',
      );
    }

    // Hache le mot de passe s'il est fourni
    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Met à jour uniquement les champs autorisés
    Object.assign(user, updateUserDto);

    return this.userRepository.save(user); // Sauvegarde les modifications
  }

  /**
   * @title Remove a user
   * @description Remove a user by ID
   * @param id
   * @throws NotFoundException
   */
  async remove(id: string): Promise<void> {
    await this.findUserById(id);
    await this.userRepository.softDelete(id);
  }

  /**
   * @title Find a user by ID
   * @description Find a user by ID
   * @returns User
   * @param id
   * @private
   */
  private async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /**
   * @title Find a user by email
   * @description Find a user by email
   * @returns User
   * @param email
   */
  async findOneByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }
}
