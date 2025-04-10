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
} from '@nestjs/common';
import { User } from '../decorators/user.decorator';
import {
  AgentResponseDto,
  CreateAgentDto,
  FindAgentsDto,
  UpdateAgentDto,
} from '../dto/agent.dto';
import { AgentService } from '../service/agent.service';

@Controller('agents')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post()
  // @UseGuards(JwtAuthGuard)
  async create(
    @Body() createAgentDto: CreateAgentDto,
    @User('id') userId: string,
  ): Promise<AgentResponseDto> {
    return this.agentService.create({
      ...createAgentDto,
      created_by: userId,
    });
  }

  @Get()
  async findAll(@Query() findAgentsDto: FindAgentsDto): Promise<{
    items: AgentResponseDto[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    return this.agentService.findAll(findAgentsDto);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AgentResponseDto> {
    return this.agentService.findOne(id);
  }

  @Patch(':id')
  // @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAgentDto: UpdateAgentDto,
    @User('id') userId: string,
  ): Promise<AgentResponseDto> {
    return this.agentService.update(id, updateAgentDto, userId);
  }

  @Delete(':id')
  // @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @User('id') userId: string,
  ): Promise<void> {
    return this.agentService.remove(id, userId);
  }
}
