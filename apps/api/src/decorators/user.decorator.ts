import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract user information from the request
 *
 * Usage examples:
 * - @User() user: UserEntity - Gets the entire user object
 * - @User('id') userId: string - Gets just the user ID
 * - @User('email') email: string - Gets just the user email
 */
export const User = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // If no specific property is requested, return the entire user object
    if (!data) {
      return user;
    }

    // Return the specific property if it exists
    return user && user[data] ? user[data] : undefined;
  },
);
