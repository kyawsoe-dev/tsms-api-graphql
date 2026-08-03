import { Args, Context, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GraphQLContext } from '../graphql/context.interface';
import { PaginationArgs } from '../common/dto/pagination.args';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';
import { Task } from '../tasks/models/task.model';
import { User } from '../users/models/user.model';
import { CreateProjectInput } from './dto/create-project.input';
import { UpdateProjectInput } from './dto/update-project.input';
import { Project } from './models/project.model';
import { ProjectsService } from './projects.service';

@Resolver(() => Project)
export class ProjectsResolver {
  constructor(private readonly projectsService: ProjectsService) {}

  @Query(() => [Project])
  @UseGuards(GqlAuthGuard)
  async projects(
    @CurrentUser() currentUser: JwtPayload,
    @Args() pagination: PaginationArgs,
  ): Promise<Project[]> {
    return this.projectsService.findAll(
      currentUser.sub,
      pagination.skip,
      pagination.take,
    );
  }

  @Query(() => Project)
  @UseGuards(GqlAuthGuard)
  async project(
    @CurrentUser() currentUser: JwtPayload,
    @Args('id', { type: () => String }) id: string,
  ): Promise<Project> {
    return this.projectsService.findOne(currentUser.sub, id);
  }

  @Mutation(() => Project)
  @UseGuards(GqlAuthGuard)
  async createProject(
    @CurrentUser() currentUser: JwtPayload,
    @Args('input') input: CreateProjectInput,
  ): Promise<Project> {
    return this.projectsService.create(currentUser.sub, input);
  }

  @Mutation(() => Project)
  @UseGuards(GqlAuthGuard)
  async updateProject(
    @CurrentUser() currentUser: JwtPayload,
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateProjectInput,
  ): Promise<Project> {
    return this.projectsService.update(currentUser.sub, id, input);
  }

  @Mutation(() => Project)
  @UseGuards(GqlAuthGuard)
  async deleteProject(
    @CurrentUser() currentUser: JwtPayload,
    @Args('id', { type: () => String }) id: string,
  ): Promise<Project> {
    return this.projectsService.remove(currentUser.sub, id);
  }

  @ResolveField(() => User, { nullable: true })
  async owner(
    @Parent() project: Project,
    @Context() context: GraphQLContext,
  ): Promise<User | null> {
    return context.dataloaders.projectOwner.load(project.ownerId);
  }

  @ResolveField(() => [Task], { nullable: true })
  async tasks(
    @Parent() project: Project,
    @Context() context: GraphQLContext,
  ): Promise<Task[]> {
    return context.dataloaders.projectTasks.load(project.id);
  }
}
