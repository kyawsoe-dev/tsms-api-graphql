import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { PrismaService } from '../prisma/prisma.service';
import { PUB_SUB } from '../graphql/pubsub/pubsub.module';
import { CreateCommentInput } from './dto/create-comment.input';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  async create(authorId: string, input: CreateCommentInput) {
    const task = await this.prisma.task.findUnique({
      where: { id: input.taskId },
    });
    if (!task) {
      throw new NotFoundException(`Task ${input.taskId} not found`);
    }

    const comment = await this.prisma.comment.create({
      data: {
        body: input.body,
        taskId: input.taskId,
        authorId,
      },
    });

    await this.pubSub.publish('commentAdded', { commentAdded: comment });
    return comment;
  }

  async findOne(id: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      throw new NotFoundException(`Comment ${id} not found`);
    }
    return comment;
  }

  async remove(id: string) {
    const comment = await this.findOne(id);
    await this.prisma.comment.delete({ where: { id } });
    return comment;
  }
}
