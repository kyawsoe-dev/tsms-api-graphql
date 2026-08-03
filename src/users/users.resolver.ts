import { Args, Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { GraphQLContext } from '../graphql/context.interface';
import { PaginationArgs } from '../common/dto/pagination.args';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';
import { UseGuards } from '@nestjs/common';
import { Project } from '../projects/models/project.model';
import { User } from './models/user.model';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() currentUser: JwtPayload): Promise<User> {
    return this.usersService.getByIdOrFail(currentUser.sub);
  }

  @Query(() => [User])
  @UseGuards(GqlAuthGuard)
  async users(@Args() pagination: PaginationArgs): Promise<User[]> {
    return this.usersService.findAll(pagination.skip, pagination.take);
  }

  @ResolveField(() => [Project], { name: 'ownedProjects' })
  async ownedProjects(
    @Parent() user: User,
    @Context() context: GraphQLContext,
  ): Promise<Project[]> {
    return context.dataloaders.userProjects.load(user.id);
  }
}
