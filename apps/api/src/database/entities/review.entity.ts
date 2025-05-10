import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AgentEntity } from './agent.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'reviews' })
export class ReviewEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'float' })
  rating: number;

  @Column({ type: 'text' })
  comment: string;

  @Column()
  agentId: string;

  @ManyToOne(() => AgentEntity, (agent) => agent.reviews, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'agentId' })
  agent: AgentEntity;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.reviews, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
