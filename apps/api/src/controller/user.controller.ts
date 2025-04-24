import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard, JwtAuthGuard } from 'src/auth/auth.guard';
import { User } from '../decorators/user.decorator';
import {
  CreateUserDto,
  FindUsersDto,
  LoginUserDto,
  UpdateUserDto,
  UserResponseDto,
} from '../dto/user.dto';
import { UserService } from '../service/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(createUserDto);
  }

  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<{ user: UserResponseDto; token: string }> {
    return this.userService.login(loginUserDto);
  }

  @Get()
  @UseGuards(AdminGuard)
  async findAll(@Query() findUsersDto: FindUsersDto): Promise<{
    items: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    return this.userService.findAll(findUsersDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@User() user): Promise<UserResponseDto> {
    return this.userService.findOne(user.id);
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @User('id') userId: string,
    @User('role') userRole: string,
  ): Promise<UserResponseDto> {
    // Check if user is updating their own profile or is an admin
    const canUpdate = id === userId || userRole === 'ADMIN';
    return this.userService.update(id, updateUserDto, canUpdate);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.userService.remove(id);
  }
}
