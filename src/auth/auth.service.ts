import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from '../dto/user.dto';
import { UserService } from '../service/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      // Find user by email - this would be a custom method to add to UserService
      const user = await this.userService.findUserByEmail(email);

      if (!user) {
        return null;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash,
      );
      if (!isPasswordValid) {
        return null;
      }

      // Remove sensitive data
      const { password_hash, ...result } = user;
      return result;
    } catch (error) {
      return null;
    }
  }

  async login(loginUserDto: LoginUserDto) {
    // Use the existing login method from UserService
    return this.userService.login(loginUserDto);
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userService.findOne(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
