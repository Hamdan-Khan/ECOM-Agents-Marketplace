import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from 'src/controller/order.controller';
import { AgentEntity } from 'src/database/entities/agent.entity';
import { OrderEntity } from 'src/database/entities/order.entity';
import { UserEntity } from 'src/database/entities/user.entity';
import { OrderService } from 'src/service/order.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, UserEntity, AgentEntity])],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
