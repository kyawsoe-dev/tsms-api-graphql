import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
  @Query(() => String)
  async health(): Promise<string> {
    return 'OK';
  }
}
