import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { PrismaService } from '../prisma/prisma.service';
import { PUB_SUB } from '../graphql/pubsub/pubsub.module';
import { CreateSubtaskInput } from './dto/create-subtask.input';
import { UpdateSubtaskInput } from './dto/update-subtask.input';

@Injectable()
export class SubtasksService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  async create(input: CreateSubtaskInput) {
    const task = await this.prisma.task.findUnique({
      where: { id: input.taskId },
    });
    if (!task) {
      throw new NotFoundException(`Task ${input.taskId} not found`);
    }

    const subtask = await this.prisma.subtask.create({
      data: {
        title: input.title,
        taskId: input.taskId,
        order: input.order ?? 0,
        done: input.done ?? false,
      },
    });

    await this.publishTaskUpdate(task.id);
    return subtask;
  }

  async findOne(id: string) {
    const subtask = await this.prisma.subtask.findUnique({ where: { id } });
    if (!subtask) {
      throw new NotFoundException(`Subtask ${id} not found`);
    }
    return subtask;
  }

  async update(id: string, input: UpdateSubtaskInput) {
    const subtask = await this.findOne(id);
    const updated = await this.prisma.subtask.update({
      where: { id },
      data: input,
    });

    await this.publishTaskUpdate(subtask.taskId);
    return updated;
  }

  async remove(id: string) {
    const subtask = await this.findOne(id);
    await this.prisma.subtask.delete({ where: { id } });

    await this.publishTaskUpdate(subtask.taskId);
    return subtask;
  }

  /**
   * Subtask changes alter the parent task, so broadcast a `taskUpdated` event
   * so open task drawers / boards can refresh.
   */
  private async publishTaskUpdate(taskId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (task) {
      await this.pubSub.publish('taskUpdated', { taskUpdated: task });
    }
  }
}
