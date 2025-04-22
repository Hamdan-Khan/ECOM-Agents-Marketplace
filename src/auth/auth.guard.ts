import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '../database/entities/user.entity';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}

@Injectable()
export class AdminGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First, make sure the user is authenticated
    const isAuth = await super.canActivate(context);
    if (!isAuth) {
      return false;
    }

    // Get the user from the request object
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if the user has the ADMIN role
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied. Admin role required.');
    }

    return true;
  }
}
