import { ChildEntity } from 'typeorm';
import { UserEntity, UserRole } from './user.entity';

@ChildEntity()
export class AdminEntity extends UserEntity {
  constructor() {
    super();
    this.role = UserRole.ADMIN;
  }
}
