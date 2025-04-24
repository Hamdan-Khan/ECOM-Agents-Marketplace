import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from '../controller/payment.controller';
import { OrderEntity } from '../database/entities/order.entity';
import { PaymentEntity } from '../database/entities/payment.entity';
import { UserEntity } from '../database/entities/user.entity';
import { PaymentService } from '../service/payment.service';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity, OrderEntity, UserEntity])],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
