import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  TableInheritance,
  UpdateDateColumn,
} from 'typeorm';
import { AgentEntity } from './agent.entity';
import { OrderEntity } from './order.entity';
import { PaymentEntity } from './payment.entity';
import { ReviewEntity } from './review.entity';
import { SubscriptionEntity } from './subscription.entity';
import { TokenTransactionEntity } from './token-transaction.entity';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity({ name: 'users' })
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ default: 0 })
  token_balance: number;

  @OneToMany(() => AgentEntity, (aiAgent) => aiAgent.created_by)
  agents: AgentEntity[];

  @OneToMany(() => OrderEntity, (order) => order.user)
  orders: OrderEntity[];

  @OneToMany(() => SubscriptionEntity, (subscription) => subscription.user)
  subscriptions: SubscriptionEntity[];

  @OneToMany(() => ReviewEntity, (review) => review.agent)
  reviews: ReviewEntity[];

  @OneToMany(() => TokenTransactionEntity, (transaction) => transaction.user)
  token_transactions: TokenTransactionEntity[];

  @OneToMany(() => PaymentEntity, (payment) => payment.user)
  payments: PaymentEntity[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
