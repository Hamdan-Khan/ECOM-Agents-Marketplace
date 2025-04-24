import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { AgentEntity } from '../database/entities/agent.entity';
import { UserEntity } from '../database/entities/user.entity';
import {
  AgentResponseDto,
  CreateAgentDto,
  FindAgentsDto,
  UpdateAgentDto,
} from '../dto/agent.dto';

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(createAgentDto: CreateAgentDto): Promise<AgentResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: createAgentDto.created_by },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const newAgent = this.agentRepository.create({
      ...createAgentDto,
      created_by: user,
    });

    const savedAgent = await this.agentRepository.save(newAgent);
    return this.mapToResponseDto(savedAgent);
  }

  async findAll(findAgentsDto: FindAgentsDto): Promise<{
    items: AgentResponseDto[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      category,
      minPrice,
      maxPrice,
      query,
    } = findAgentsDto;

    // Building where conditions
    const whereConditions: any = {};

    if (category) {
      whereConditions.category = category;
    }

    // Price range filtering
    if (minPrice !== undefined || maxPrice !== undefined) {
      whereConditions.price = {};
      if (minPrice !== undefined) {
        whereConditions.price = { ...whereConditions.price, gte: minPrice };
      }
      if (maxPrice !== undefined) {
        whereConditions.price = { ...whereConditions.price, lte: maxPrice };
      }
    }

    // Search in name or description
    if (query) {
      whereConditions.name = Like(`%${query}%`);
      // You might want to use more advanced searching, this is just a simple example
    }

    const [agents, total] = await this.agentRepository.findAndCount({
      where: whereConditions,
      relations: ['created_by'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    const pages = Math.ceil(total / limit);

    return {
      items: agents.map((agent) => this.mapToResponseDto(agent)),
      total,
      page,
      limit,
      pages,
    };
  }

  async findOne(id: string): Promise<AgentResponseDto> {
    const agent = await this.agentRepository.findOne({
      where: { id },
      relations: ['created_by'],
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }

    return this.mapToResponseDto(agent);
  }

  async update(
    id: string,
    updateAgentDto: UpdateAgentDto,
    userId: string,
  ): Promise<AgentResponseDto> {
    const agent = await this.agentRepository.findOne({
      where: { id },
      relations: ['created_by'],
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }

    // Check if the user is the creator of the agent
    if (agent.created_by.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this agent',
      );
    }

    // Update the agent
    Object.assign(agent, updateAgentDto);
    const updatedAgent = await this.agentRepository.save(agent);

    return this.mapToResponseDto(updatedAgent);
  }

  async remove(id: string, userId: string): Promise<void> {
    const agent = await this.agentRepository.findOne({
      where: { id },
      relations: ['created_by'],
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }

    // Check if the user is the creator of the agent
    if (agent.created_by.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this agent',
      );
    }

    await this.agentRepository.remove(agent);
  }

  // Helper method to map entity to response DTO
  private mapToResponseDto(agent: AgentEntity): AgentResponseDto {
    return {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      category: agent.category,
      price: agent.price,
      subscription_price: agent.subscription_price,
      created_by: agent.created_by.id,
      created_at: agent.created_at,
      updated_at: agent.updated_at,
    };
  }
}
