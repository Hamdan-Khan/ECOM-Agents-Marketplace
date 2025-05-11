// Import the enum from the entity
import { AgentEntity } from 'src/database/entities/agent.entity';
import { UserRole } from 'src/database/entities/user.entity';

// Base DTO with common properties
export class BaseUserDto {
  name: string;
  email: string;
}

// DTO for user creation
export class CreateUserDto extends BaseUserDto {
  password: string; // Plain text password to be hashed
  role?: UserRole;
}

// DTO for updating user information
export class UpdateUserDto {
  name?: string;
  email?: string;
  password?: string; // Optional password update
  role?: UserRole;
  token_balance?: number;
  password_hash: string;
}

// DTO for user responses (excludes sensitive data)
export class UserResponseDto extends BaseUserDto {
  id: string;
  role: UserRole;
  owned_agents: AgentEntity[];
  token_balance: number;
  created_at: Date;
  updated_at: Date;
}

// DTO for user login
export class LoginUserDto {
  email: string;
  password: string;
}

// DTO for finding users with pagination and filters
export class FindUsersDto {
  page?: number = 1;
  limit?: number = 10;
  role?: UserRole;
  query?: string; // For searching by name or email
}
