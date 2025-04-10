import { AgentCategory } from 'src/database/entities/agent.entity';

// Base DTO containing common properties
export class BaseAgentDto {
  name: string;
  description: string;
  category: AgentCategory;
  price: number;
  subscription_price?: number;
}

// Used for creating a new agent
export class CreateAgentDto extends BaseAgentDto {
  created_by: string; // Just the ID of the user
}

// Used for updating an existing agent
export class UpdateAgentDto {
  name?: string;
  description?: string;
  category?: AgentCategory;
  price?: number;
  subscription_price?: number;
}

// Used for returning agent data to clients
export class AgentResponseDto extends BaseAgentDto {
  id: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

// DTO for pagination and filtering
export class FindAgentsDto {
  page?: number = 1;
  limit?: number = 10;
  category?: AgentCategory;
  minPrice?: number;
  maxPrice?: number;
  query?: string; // For searching in name or description
}
