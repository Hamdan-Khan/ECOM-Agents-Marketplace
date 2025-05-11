import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentEntity } from 'src/database/entities/agent.entity';
import { UserEntity } from 'src/database/entities/user.entity';
import { OrderEntity } from 'src/database/entities/order.entity';
import { StripeController } from '../controller/stripe.controller';
import { StripeService } from '../service/stripe.service';
import { OrderModule } from './order.module';

@Module({  imports: [
    TypeOrmModule.forFeature([UserEntity, AgentEntity, OrderEntity]),
    ConfigModule.forRoot(),
    forwardRef(() => OrderModule),
  ],
  controllers: [StripeController],
  providers: [StripeService],
})
export class StripeModule {}
