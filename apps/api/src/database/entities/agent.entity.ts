import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderEntity } from './order.entity';
import { ReviewEntity } from './review.entity';
import { SubscriptionEntity } from './subscription.entity';
import { TokenTransactionEntity } from './token-transaction.entity';
import { UserEntity } from './user.entity';

export enum AgentCategory {
  NLP = 'NLP',
  COMPUTER_VISION = 'COMPUTER_VISION',
  ANALYTICS = 'ANALYTICS',
  BOTS = 'BOTS',
  WORKFLOW_HELPERS = 'WORKFLOW_HELPERS',
}

@Entity({ name: 'agents' })
export class AgentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: AgentCategory,
  })
  category: AgentCategory;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  subscription_price: number;

  @ManyToOne(() => UserEntity, (user) => user.agents)
  @JoinColumn({ name: 'created_by' })
  created_by: UserEntity;

  @OneToMany(() => OrderEntity, (order) => order.agent)
  orders: OrderEntity[];

  @OneToMany(() => SubscriptionEntity, (subscription) => subscription.agent)
  subscriptions: SubscriptionEntity[];

  @OneToMany(() => ReviewEntity, (review) => review.agent)
  reviews: ReviewEntity[];

  @OneToMany(() => TokenTransactionEntity, (transaction) => transaction.agent)
  token_transactions: TokenTransactionEntity[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
