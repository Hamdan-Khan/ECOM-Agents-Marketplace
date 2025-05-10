import { BaseAgentDto } from './agent.dto';
import { BaseUserDto } from './user.dto';

// Base DTO
export class BaseReviewDto {
  rating: number;
  comment: string;
}

// Create DTO
export class CreateReviewDto extends BaseReviewDto {
  agentId: string;
  userId: string;
}

// Update DTO
export class UpdateReviewDto {
  rating?: number;
  comment?: string;
}

// Response DTO
export class ReviewResponseDto extends BaseReviewDto {
  id: string;
  agentId: string;
  userId: string;
  agent?: BaseAgentDto;
  user?: BaseUserDto;
  created_at: Date;
  updated_at: Date;
}
