import { UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { GraphQLContext } from '../graphql/context.interface';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';
import { Task } from '../tasks/models/task.model';
import { User } from '../users/models/user.model';
import { AttachmentsService } from './attachments.service';
import { CreateAttachmentInput } from './dto/create-attachment.input';
import { Attachment } from './models/attachment.model';

@Resolver(() => Attachment)
export class AttachmentsResolver {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Mutation(() => Attachment)
  @UseGuards(GqlAuthGuard)
  async createAttachment(
    @CurrentUser() currentUser: JwtPayload,
    @Args('input') input: CreateAttachmentInput,
  ): Promise<Attachment> {
    return this.attachmentsService.create(currentUser.sub, input);
  }

  @Mutation(() => Attachment)
  @UseGuards(GqlAuthGuard)
  async deleteAttachment(
    @Args('id', { type: () => String }) id: string,
  ): Promise<Attachment> {
    return this.attachmentsService.remove(id);
  }

  @ResolveField(() => Task, { nullable: true })
  async task(
    @Parent() attachment: Attachment,
    @Context() context: GraphQLContext,
  ): Promise<Task | null> {
    return context.dataloaders.taskById.load(attachment.taskId);
  }

  @ResolveField(() => User, { nullable: true })
  async uploadedBy(
    @Parent() attachment: Attachment,
    @Context() context: GraphQLContext,
  ): Promise<User | null> {
    return context.dataloaders.attachmentUploader.load(attachment.uploadedById);
  }
}
