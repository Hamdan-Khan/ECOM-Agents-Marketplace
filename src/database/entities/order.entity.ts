import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AgentEntity } from './agent.entity';
import { PaymentEntity } from './payment.entity';
import { TokenTransactionEntity } from './token-transaction.entity';
import { UserEntity } from './user.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum OrderType {
  ONE_TIME = 'ONE_TIME',
  SUBSCRIPTION = 'SUBSCRIPTION',
  TOKEN_PURCHASE = 'TOKEN_PURCHASE',
}

@Entity({ name: 'orders' })
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column()
  user_id: string;

  @ManyToOne(() => AgentEntity, (aiAgent) => aiAgent.orders)
  @JoinColumn({ name: 'agent_id' })
  agent: AgentEntity;

  @Column({ nullable: true })
  agent_id: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  payment_status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: OrderType,
  })
  order_type: OrderType;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ unique: true })
  transaction_id: string;

  @OneToMany(() => PaymentEntity, (payment) => payment.order)
  payments: PaymentEntity[];

  @OneToMany(() => TokenTransactionEntity, (transaction) => transaction.order)
  token_transactions: TokenTransactionEntity[];

  @CreateDateColumn()
  created_at: Date;
}
