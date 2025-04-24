import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderEntity } from './order.entity';
import { UserEntity } from './user.entity';

export enum PaymentGateway {
  JAZZCASH = 'JAZZCASH',
  PAYPRO = 'PAYPRO',
}

export enum PaymentStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

@Entity({ name: 'payments' })
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OrderEntity, (order) => order.payments)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @Column()
  order_id: string;

  @ManyToOne(() => UserEntity, (user) => user.payments)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column()
  user_id: string;

  @Column({
    type: 'enum',
    enum: PaymentGateway,
  })
  payment_gateway: PaymentGateway;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  payment_status: PaymentStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ unique: true })
  transaction_id: string;

  @CreateDateColumn()
  created_at: Date;
}
