import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Like, Repository } from 'typeorm';
import { UserEntity } from '../database/entities/user.entity';
import {
  CreateUserDto,
  FindUsersDto,
  LoginUserDto,
  UpdateUserDto,
  UserResponseDto,
} from '../dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    // Hash password
    const passwordHash = await this.hashPassword(createUserDto.password);

    // Create new user
    const newUser = this.userRepository.create({
      ...createUserDto,
      password_hash: passwordHash,
      token_balance: 0, // Default starting balance
    });

    const savedUser = await this.userRepository.save(newUser);
    return this.mapToResponseDto(savedUser);
  }

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ user: UserResponseDto; token: string }> {
    const { email, password } = loginUserDto;

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      user: this.mapToResponseDto(user),
      token,
    };
  }

  async findAll(findUsersDto: FindUsersDto): Promise<{
    items: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const { page = 1, limit = 10, role, query } = findUsersDto;

    // Build where conditions
    const whereConditions: any = {};

    if (role) {
      whereConditions.role = role;
    }

    // Search by name or email
    if (query) {
      whereConditions.name = Like(`%${query}%`);
      // You might want to use more advanced searching for emails too
    }

    const [users, total] = await this.userRepository.findAndCount({
      where: whereConditions,
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    const pages = Math.ceil(total / limit);

    return {
      items: users.map((user) => this.mapToResponseDto(user)),
      total,
      page,
      limit,
      pages,
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.mapToResponseDto(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    canUpdate: boolean,
  ): Promise<UserResponseDto> {
    if (!canUpdate) {
      throw new ForbiddenException(
        'You do not have permission to update this user',
      );
    }

    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // If email is being updated, check that it's not already in use
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new BadRequestException('Email already in use');
      }
    }

    // Hash password if provided
    if (updateUserDto.password) {
      updateUserDto.password_hash = await this.hashPassword(
        updateUserDto.password,
      );
      delete updateUserDto.password; // Remove plain text password
    }

    // Update user
    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    return this.mapToResponseDto(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.remove(user);
  }

  // Helper method to hash passwords
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  // Helper method to map entity to response DTO
  private mapToResponseDto(user: UserEntity): UserResponseDto {
    const { id, name, email, role, token_balance, created_at, updated_at } =
      user;
    return {
      id,
      name,
      email,
      role,
      token_balance,
      created_at,
      updated_at,
    };
  }
}
