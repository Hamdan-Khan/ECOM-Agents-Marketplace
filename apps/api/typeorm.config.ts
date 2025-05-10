import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { AdminEntity } from './src/database/entities/admin.entity';
import { AgentEntity } from './src/database/entities/agent.entity';
import { OrderEntity } from './src/database/entities/order.entity';
import { PaymentEntity } from './src/database/entities/payment.entity';
import { SubscriptionEntity } from './src/database/entities/subscription.entity';
import { TokenTransactionEntity } from './src/database/entities/token-transaction.entity';
import { UserEntity } from './src/database/entities/user.entity';

config();

export default new DataSource({
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
  ],
  migrations: ['./src/database/migrations/*.ts'],
  synchronize: false,
});
