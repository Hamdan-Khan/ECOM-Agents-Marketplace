import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentController } from 'src/controller/agent.controller';
import { AgentEntity } from 'src/database/entities/agent.entity';
import { UserEntity } from 'src/database/entities/user.entity';
import { AgentService } from 'src/service/agent.service';

@Module({
  imports: [TypeOrmModule.forFeature([AgentEntity, UserEntity])],
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
