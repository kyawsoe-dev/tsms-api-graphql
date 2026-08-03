import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Status } from '@prisma/client';
import { PubSub } from 'graphql-subscriptions';
import { PrismaService } from '../prisma/prisma.service';
import { PUB_SUB } from '../graphql/pubsub/pubsub.module';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';
import { TasksArgs } from './dto/tasks.args';

/**
 * Task service. Every mutation that changes a Task publishes an event through
 * PubSub so that subscribed clients (e.g. the Kanban board) stay in sync.
 */
@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  async create(userId: string, input: CreateTaskInput) {
    const project = await this.prisma.project.findUnique({
      where: { id: input.projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project ${input.projectId} not found`);
    }

    const task = await this.prisma.task.create({
      data: {
        title: input.title,
        description: input.description,
        status: input.status ?? undefined,
        priority: input.priority ?? undefined,
        dueDate: input.dueDate,
        projectId: input.projectId,
        createdById: userId,
        assignees: input.assigneeIds?.length
          ? { create: input.assigneeIds.map((assigneeId) => ({ userId: assigneeId })) }
          : undefined,
        tags: input.tagIds?.length
          ? { create: input.tagIds.map((tagId) => ({ tagId })) }
          : undefined,
      },
    });

    await this.pubSub.publish('taskAdded', { taskAdded: task });
    return task;
  }

  findAll(args: TasksArgs) {
    return this.prisma.task.findMany({
      where: {
        projectId: args.projectId,
        status: args.status,
        priority: args.priority,
        assignees: args.assigneeId
          ? { some: { userId: args.assigneeId } }
          : undefined,
        title: args.search
          ? { contains: args.search, mode: 'insensitive' }
          : undefined,
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      skip: args.skip,
      take: args.take,
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }

  async update(id: string, input: UpdateTaskInput) {
    await this.findOne(id);
    const { assigneeIds, tagIds, ...data } = input;

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        ...data,
        assignees: assigneeIds
          ? {
              deleteMany: {},
              create: assigneeIds.map((assigneeId) => ({ userId: assigneeId })),
            }
          : undefined,
        tags: tagIds
          ? {
              deleteMany: {},
              create: tagIds.map((tagId) => ({ tagId })),
            }
          : undefined,
      },
    });

    await this.pubSub.publish('taskUpdated', { taskUpdated: task });
    return task;
  }

  async updateStatus(id: string, status: Status) {
    await this.findOne(id);
    const task = await this.prisma.task.update({
      where: { id },
      data: { status },
    });

    await this.pubSub.publish('taskUpdated', { taskUpdated: task });
    return task;
  }

  async remove(id: string) {
    const task = await this.findOne(id);
    // Children (subtasks, comments, attachments) are removed via cascade.
    await this.prisma.task.delete({ where: { id } });

    await this.pubSub.publish('taskDeleted', { taskDeleted: task });
    return task;
  }
}
