import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminEntity } from './entities/admin.entity';
import { AgentEntity } from './entities/agent.entity';
import { OrderEntity } from './entities/order.entity';
import { PaymentEntity } from './entities/payment.entity';
import { ReviewEntity } from './entities/review.entity';
import { SubscriptionEntity } from './entities/subscription.entity';
import { TokenTransactionEntity } from './entities/token-transaction.entity';
import { UserEntity } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        AgentEntity,
        AdminEntity,
        UserEntity,
        TokenTransactionEntity,
        SubscriptionEntity,
        PaymentEntity,
        OrderEntity,
        ReviewEntity,
      ],
    }),
  ],
})
export class DBModule {}
