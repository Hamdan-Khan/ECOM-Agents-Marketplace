import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AgentEntity } from 'src/database/entities/agent.entity';
import { ReviewEntity } from 'src/database/entities/review.entity';
import { UserEntity } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateReviewDto, UpdateReviewDto } from '../dto/review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewRepo: Repository<ReviewEntity>,
    @InjectRepository(AgentEntity)
    private readonly agentRepo: Repository<AgentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async create(dto: CreateReviewDto): Promise<ReviewEntity> {
    // Find the agent and user by their IDs
    const agent = await this.agentRepo.findOneBy({ id: dto.agentId });
    if (!agent)
      throw new NotFoundException(`Agent with ID ${dto.agentId} not found`);

    const user = await this.userRepo.findOneBy({ id: dto.userId });
    if (!user)
      throw new NotFoundException(`User with ID ${dto.userId} not found`);

    // Create and save the review
    const review = this.reviewRepo.create({
      rating: dto.rating,
      comment: dto.comment,
      agentId: dto.agentId,
      userId: dto.userId,
      agent,
      user,
    });

    return await this.reviewRepo.save(review);
  }

  async findAll(): Promise<ReviewEntity[]> {
    return await this.reviewRepo.find({
      relations: ['agent', 'user'],
    });
  }

  async findOne(id: string): Promise<ReviewEntity> {
    const review = await this.reviewRepo.findOne({
      where: { id },
      relations: ['agent', 'user'],
    });

    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async update(id: string, dto: UpdateReviewDto): Promise<ReviewEntity> {
    const review = await this.reviewRepo.findOneBy({ id });
    if (!review) throw new NotFoundException('Review not found');

    // Update simple fields
    if (dto.rating !== undefined) review.rating = dto.rating;
    if (dto.comment !== undefined) review.comment = dto.comment;

    await this.reviewRepo.save(review);
    return this.findOne(id); // Return the updated review with relations
  }

  async delete(id: string): Promise<void> {
    const result = await this.reviewRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Review not found');
  }
}
