import { Inject, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { GraphQLContext } from '../graphql/context.interface';
import { PUB_SUB } from '../graphql/pubsub/pubsub.module';
import { Status } from '../common/enums/status.enum';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';
import { Attachment } from '../attachments/models/attachment.model';
import { Comment } from '../comments/models/comment.model';
import { Project } from '../projects/models/project.model';
import { Subtask } from '../subtasks/models/subtask.model';
import { Tag } from '../tags/models/tag.model';
import { User } from '../users/models/user.model';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';
import { TasksArgs } from './dto/tasks.args';
import { Task } from './models/task.model';
import { TasksService } from './tasks.service';

type TaskEvent = { taskAdded: Task } | { taskUpdated: Task } | { taskDeleted: Task };

@Resolver(() => Task)
export class TasksResolver {
  constructor(
    private readonly tasksService: TasksService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  // ------------------------------------------------------------------------
  // Queries
  // ------------------------------------------------------------------------

  @Query(() => [Task])
  @UseGuards(GqlAuthGuard)
  async tasks(@Args() args: TasksArgs): Promise<Task[]> {
    return this.tasksService.findAll(args);
  }

  @Query(() => Task)
  @UseGuards(GqlAuthGuard)
  async task(@Args('id', { type: () => String }) id: string): Promise<Task> {
    return this.tasksService.findOne(id);
  }

  // ------------------------------------------------------------------------
  // Mutations
  // ------------------------------------------------------------------------

  @Mutation(() => Task)
  @UseGuards(GqlAuthGuard)
  async createTask(
    @CurrentUser() currentUser: JwtPayload,
    @Args('input') input: CreateTaskInput,
  ): Promise<Task> {
    return this.tasksService.create(currentUser.sub, input);
  }

  @Mutation(() => Task)
  @UseGuards(GqlAuthGuard)
  async updateTask(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateTaskInput,
  ): Promise<Task> {
    return this.tasksService.update(id, input);
  }

  @Mutation(() => Task)
  @UseGuards(GqlAuthGuard)
  async updateTaskStatus(
    @Args('id', { type: () => String }) id: string,
    @Args('status', { type: () => Status }) status: Status,
  ): Promise<Task> {
    return this.tasksService.updateStatus(id, status);
  }

  @Mutation(() => Task)
  @UseGuards(GqlAuthGuard)
  async deleteTask(@Args('id', { type: () => String }) id: string): Promise<Task> {
    return this.tasksService.remove(id);
  }

  // ------------------------------------------------------------------------
  // Subscriptions
  // ------------------------------------------------------------------------

  @Subscription(() => Task, {
    description: 'Emitted when a task is created',
    filter: (payload: TaskEvent, variables: { projectId?: string }) => {
      if (!('taskAdded' in payload)) return false;
      return !variables.projectId || payload.taskAdded.projectId === variables.projectId;
    },
  })
  taskAdded(@Args('projectId', { type: () => String, nullable: true }) _projectId?: string) {
    return this.pubSub.asyncIterator('taskAdded');
  }

  @Subscription(() => Task, {
    description: 'Emitted when a task is updated (incl. status changes)',
    filter: (payload: TaskEvent, variables: { projectId?: string }) => {
      if (!('taskUpdated' in payload)) return false;
      return !variables.projectId || payload.taskUpdated.projectId === variables.projectId;
    },
  })
  taskUpdated(@Args('projectId', { type: () => String, nullable: true }) _projectId?: string) {
    return this.pubSub.asyncIterator('taskUpdated');
  }

  @Subscription(() => Task, {
    description: 'Emitted when a task is deleted',
    filter: (payload: TaskEvent, variables: { projectId?: string }) => {
      if (!('taskDeleted' in payload)) return false;
      return !variables.projectId || payload.taskDeleted.projectId === variables.projectId;
    },
  })
  taskDeleted(@Args('projectId', { type: () => String, nullable: true }) _projectId?: string) {
    return this.pubSub.asyncIterator('taskDeleted');
  }

  // ------------------------------------------------------------------------
  // Field resolvers (N+1-safe via context DataLoaders)
  // ------------------------------------------------------------------------

  @ResolveField(() => Project, { nullable: true })
  async project(
    @Parent() task: Task,
    @Context() context: GraphQLContext,
  ): Promise<Project | null> {
    return context.dataloaders.taskProject.load(task.projectId);
  }

  @ResolveField(() => User, { nullable: true })
  async createdBy(
    @Parent() task: Task,
    @Context() context: GraphQLContext,
  ): Promise<User | null> {
    return context.dataloaders.taskCreatedBy.load(task.createdById);
  }

  @ResolveField(() => [User], { nullable: true })
  async assignees(
    @Parent() task: Task,
    @Context() context: GraphQLContext,
  ): Promise<User[]> {
    return context.dataloaders.taskAssignees.load(task.id);
  }

  @ResolveField(() => [Subtask], { nullable: true })
  async subtasks(
    @Parent() task: Task,
    @Context() context: GraphQLContext,
  ): Promise<Subtask[]> {
    return context.dataloaders.taskSubtasks.load(task.id);
  }

  @ResolveField(() => [Comment], { nullable: true })
  async comments(
    @Parent() task: Task,
    @Context() context: GraphQLContext,
  ): Promise<Comment[]> {
    return context.dataloaders.taskComments.load(task.id);
  }

  @ResolveField(() => [Tag], { nullable: true })
  async tags(
    @Parent() task: Task,
    @Context() context: GraphQLContext,
  ): Promise<Tag[]> {
    return context.dataloaders.taskTags.load(task.id);
  }

  @ResolveField(() => [Attachment], { nullable: true })
  async attachments(
    @Parent() task: Task,
    @Context() context: GraphQLContext,
  ): Promise<Attachment[]> {
    return context.dataloaders.taskAttachments.load(task.id);
  }
}
