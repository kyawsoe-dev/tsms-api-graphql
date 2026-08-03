import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { GraphQLContext } from '../../graphql/context.interface';
import { JwtPayload } from '../decorators/current-user.decorator';

/**
 * HTTP-layer JWT guard that reads the `Authorization: Bearer <token>` header
 * and attaches the decoded payload to `req.user`. Works with the Express
 * transport because the GraphQL request flows through Express middleware.
 */
@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const gqlCtx = GqlExecutionContext.create(context);
    const { req } = gqlCtx.getContext<GraphQLContext>();
    const header: string | undefined = req?.headers?.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(
        header.slice('Bearer '.length),
      );
      (req as unknown as { user?: JwtPayload }).user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
