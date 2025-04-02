import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "agent" })
export class AgentEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column("text")
  description: string;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ default: false })
  isPublished: boolean;

  @Column("jsonb", { nullable: true })
  capabilities: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
