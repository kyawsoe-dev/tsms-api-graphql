import { Inject, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { GraphQLContext } from '../graphql/context.interface';
import { PUB_SUB } from '../graphql/pubsub/pubsub.module';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';
import { Task } from '../tasks/models/task.model';
import { User } from '../users/models/user.model';
import { CommentsService } from './comments.service';
import { CreateCommentInput } from './dto/create-comment.input';
import { Comment } from './models/comment.model';

@Resolver(() => Comment)
export class CommentsResolver {
  constructor(
    private readonly commentsService: CommentsService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Mutation(() => Comment)
  @UseGuards(GqlAuthGuard)
  async addComment(
    @CurrentUser() currentUser: JwtPayload,
    @Args('input') input: CreateCommentInput,
  ): Promise<Comment> {
    return this.commentsService.create(currentUser.sub, input);
  }

  @Mutation(() => Comment)
  @UseGuards(GqlAuthGuard)
  async deleteComment(
    @Args('id', { type: () => String }) id: string,
  ): Promise<Comment> {
    return this.commentsService.remove(id);
  }

  @Subscription(() => Comment, {
    description: 'Emitted when a comment is added to a task',
    filter: (payload: { commentAdded: Comment }, variables: { taskId?: string }) =>
      !variables.taskId || payload.commentAdded.taskId === variables.taskId,
  })
  commentAdded(@Args('taskId', { type: () => String, nullable: true }) _taskId?: string) {
    return this.pubSub.asyncIterator('commentAdded');
  }

  @ResolveField(() => User, { nullable: true })
  async author(
    @Parent() comment: Comment,
    @Context() context: GraphQLContext,
  ): Promise<User | null> {
    return context.dataloaders.commentAuthor.load(comment.authorId);
  }

  @ResolveField(() => Task, { nullable: true })
  async task(
    @Parent() comment: Comment,
    @Context() context: GraphQLContext,
  ): Promise<Task | null> {
    return context.dataloaders.taskById.load(comment.taskId);
  }
}
