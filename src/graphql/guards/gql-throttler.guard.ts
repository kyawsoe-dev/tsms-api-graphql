import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GraphQLContext } from '../context.interface';

/** True when `value` looks like an Express `Response` (has `header`). */
function isExpressResponse(value: unknown): boolean {
  return (
    !!value &&
    typeof (value as Record<string, unknown>).header === 'function'
  );
}

/**
 * Global rate limiter that works with the GraphQL (Apollo) transport.
 *
 * The stock `ThrottlerGuard` reads `req`/`res` from the HTTP context, but
 * GraphQL requests carry them inside the Apollo context built in `AppModule`,
 * so this guard unwraps them with `GqlExecutionContext` for `graphql` type
 * contexts and falls back to the default behaviour for everything else.
 */
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  protected getRequestResponse(context: ExecutionContext): {
    req: Record<string, any>;
    res: Record<string, any>;
  } {
    if (context.getType<GqlContextType>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext<Partial<GraphQLContext>>();
      return {
        req: ctx.req ?? {},
        res: ctx.res ?? {},
      };
    }
    return super.getRequestResponse(context);
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType<GqlContextType>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext<Partial<GraphQLContext>>();
      const isSubscription =
        gqlCtx.getInfo()?.operation?.operation === 'subscription';
      // Subscriptions stream over a single long-lived WebSocket that has no
      // HTTP request/response per message (the throttler writes rate-limit
      // headers to `res`), so they are exempt from per-request limits —
      // connection limits belong at the transport layer.
      if (isSubscription || !ctx.req || !isExpressResponse(ctx.res)) {
        return true;
      }
    }
    return super.canActivate(context);
  }
}
