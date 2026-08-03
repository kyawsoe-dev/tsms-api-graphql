import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GraphQLContext } from '../../graphql/context.interface';

export interface JwtPayload {
  /** The user id (stored in `sub` per JWT convention). */
  sub: string;
  email: string;
}

/**
 * Injects the verified JWT payload of the current user.
 * Only usable in resolvers guarded by {@link GqlAuthGuard}.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload => {
    const gqlCtx = GqlExecutionContext.create(context);
    const req = gqlCtx.getContext<GraphQLContext>().req as unknown as {
      user?: JwtPayload;
    };
    if (!req.user) {
      throw new Error('CurrentUser decorator used without GqlAuthGuard');
    }
    return req.user;
  },
);
