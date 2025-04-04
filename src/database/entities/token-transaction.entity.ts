// token-transaction.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AgentEntity } from './agent.entity';
import { OrderEntity } from './order.entity';
import { UserEntity } from './user.entity';

export enum TransactionType {
  PURCHASE = 'PURCHASE',
  SPENT = 'SPENT',
}

@Entity({ name: 'token_transactions' })
export class TokenTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.token_transactions)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column()
  user_id: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  transaction_type: TransactionType;

  @Column()
  amount: number;

  @ManyToOne(() => AgentEntity, (aiAgent) => aiAgent.token_transactions)
  @JoinColumn({ name: 'agent_id' })
  agent: AgentEntity;

  @Column({ nullable: true })
  agent_id: string;

  @ManyToOne(() => OrderEntity, (order) => order.token_transactions)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @Column({ nullable: true })
  order_id: string;

  @Column({ unique: true })
  transaction_id: string;

  @CreateDateColumn()
  created_at: Date;
}
