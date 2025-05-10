import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentEntity } from 'src/database/entities/agent.entity';
import { ReviewEntity } from 'src/database/entities/review.entity';
import { UserEntity } from 'src/database/entities/user.entity';
import { ReviewController } from '../controller/review.controller';
import { ReviewService } from '../service/review.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewEntity, UserEntity, AgentEntity])],
  providers: [ReviewService],
  controllers: [ReviewController],
})
export class ReviewModule {}
