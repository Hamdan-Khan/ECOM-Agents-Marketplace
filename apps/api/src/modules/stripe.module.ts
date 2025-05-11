import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentEntity } from 'src/database/entities/agent.entity';
import { UserEntity } from 'src/database/entities/user.entity';
import { StripeController } from '../controller/stripe.controller';
import { StripeService } from '../service/stripe.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, AgentEntity]),
    ConfigModule.forRoot(),
  ],
  controllers: [StripeController],
  providers: [StripeService],
})
export class StripeModule {}
