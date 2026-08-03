import { Injectable } from '@nestjs/common';
import DataLoader = require('dataloader');
import {
  Attachment,
  Comment,
  Project,
  Subtask,
  Tag,
  Task,
  User,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DataLoaders } from './dataloader.types';

/**
 * Factory that builds a fresh set of DataLoaders for every GraphQL request.
 * Loaders are request-scoped: keys and the batch cache must not leak between
 * different HTTP requests.
 */
@Injectable()
export class DataloaderProvider {
  constructor(private readonly prisma: PrismaService) {}

  getLoaders(): DataLoaders {
    const { prisma } = this;

    /**
     * Batches `users` by a set of ids, preserving input order and filling
     * missing ids with null (matching DataLoader contract).
     */
    async function batchUsersByIds(ids: readonly string[]): Promise<(User | null)[]> {
      const uniqueIds = [...new Set(ids)];
      const users = await prisma.user.findMany({
        where: { id: { in: uniqueIds } },
      });
      const byId = new Map(users.map((u) => [u.id, u]));
      return ids.map((id) => byId.get(id) ?? null);
    }

    async function batchProjectsByIds(ids: readonly string[]): Promise<(Project | null)[]> {
      const uniqueIds = [...new Set(ids)];
      const projects = await prisma.project.findMany({
        where: { id: { in: uniqueIds } },
      });
      const byId = new Map(projects.map((p) => [p.id, p]));
      return ids.map((id) => byId.get(id) ?? null);
    }

    return {
      taskAssignees: new DataLoader<string, User[]>(async (taskIds) => {
        const uniqueIds = [...new Set(taskIds)];
        const tasks = await prisma.task.findMany({
          where: { id: { in: uniqueIds } },
          select: {
            id: true,
            assignees: {
              orderBy: { user: { name: 'asc' } },
              select: { user: true },
            },
          },
        });
        const byTaskId = new Map(
          tasks.map((t) => [t.id, t.assignees.map((a) => a.user)]),
        );
        return taskIds.map((id) => byTaskId.get(id) ?? []);
      }),

      taskComments: new DataLoader<string, Comment[]>(async (taskIds) => {
        const uniqueIds = [...new Set(taskIds)];
        const comments = await prisma.comment.findMany({
          where: { taskId: { in: uniqueIds } },
          orderBy: { createdAt: 'asc' },
        });
        const byTaskId = new Map<string, Comment[]>();
        for (const comment of comments) {
          const list = byTaskId.get(comment.taskId) ?? [];
          list.push(comment);
          byTaskId.set(comment.taskId, list);
        }
        return taskIds.map((id) => byTaskId.get(id) ?? []);
      }),

      taskSubtasks: new DataLoader<string, Subtask[]>(async (taskIds) => {
        const uniqueIds = [...new Set(taskIds)];
        const subtasks = await prisma.subtask.findMany({
          where: { taskId: { in: uniqueIds } },
          orderBy: { order: 'asc' },
        });
        const byTaskId = new Map<string, Subtask[]>();
        for (const sub of subtasks) {
          const list = byTaskId.get(sub.taskId) ?? [];
          list.push(sub);
          byTaskId.set(sub.taskId, list);
        }
        return taskIds.map((id) => byTaskId.get(id) ?? []);
      }),

      taskTags: new DataLoader<string, Tag[]>(async (taskIds) => {
        const uniqueIds = [...new Set(taskIds)];
        const tasks = await prisma.task.findMany({
          where: { id: { in: uniqueIds } },
          select: {
            id: true,
            tags: {
              orderBy: { tag: { name: 'asc' } },
              select: { tag: true },
            },
          },
        });
        const byTaskId = new Map(
          tasks.map((t) => [t.id, t.tags.map((tt) => tt.tag)]),
        );
        return taskIds.map((id) => byTaskId.get(id) ?? []);
      }),

      taskAttachments: new DataLoader<string, Attachment[]>(async (taskIds) => {
        const uniqueIds = [...new Set(taskIds)];
        const attachments = await prisma.attachment.findMany({
          where: { taskId: { in: uniqueIds } },
          orderBy: { createdAt: 'desc' },
        });
        const byTaskId = new Map<string, Attachment[]>();
        for (const att of attachments) {
          const list = byTaskId.get(att.taskId) ?? [];
          list.push(att);
          byTaskId.set(att.taskId, list);
        }
        return taskIds.map((id) => byTaskId.get(id) ?? []);
      }),

      taskProject: new DataLoader<string, Project | null>(
        (ids) => batchProjectsByIds(ids),
      ),

      taskCreatedBy: new DataLoader<string, User | null>(
        (ids) => batchUsersByIds(ids),
      ),

      taskById: new DataLoader<string, Task | null>(async (ids) => {
        const uniqueIds = [...new Set(ids)];
        const tasks = await prisma.task.findMany({
          where: { id: { in: uniqueIds } },
        });
        const byId = new Map(tasks.map((t) => [t.id, t]));
        return ids.map((id) => byId.get(id) ?? null);
      }),

      commentAuthor: new DataLoader<string, User | null>(
        (ids) => batchUsersByIds(ids),
      ),

      attachmentUploader: new DataLoader<string, User | null>(
        (ids) => batchUsersByIds(ids),
      ),

      projectTasks: new DataLoader<string, Task[]>(async (projectIds) => {
        const uniqueIds = [...new Set(projectIds)];
        const tasks = await prisma.task.findMany({
          where: { projectId: { in: uniqueIds } },
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        });
        const byProjectId = new Map<string, Task[]>();
        for (const task of tasks) {
          const list = byProjectId.get(task.projectId) ?? [];
          list.push(task);
          byProjectId.set(task.projectId, list);
        }
        return projectIds.map((id) => byProjectId.get(id) ?? []);
      }),

      projectOwner: new DataLoader<string, User | null>(
        (ids) => batchUsersByIds(ids),
      ),

      userProjects: new DataLoader<string, Project[]>(async (userIds) => {
        const uniqueIds = [...new Set(userIds)];
        const projects = await prisma.project.findMany({
          where: { ownerId: { in: uniqueIds } },
          orderBy: { createdAt: 'asc' },
        });
        const byUserId = new Map<string, Project[]>();
        for (const project of projects) {
          const list = byUserId.get(project.ownerId) ?? [];
          list.push(project);
          byUserId.set(project.ownerId, list);
        }
        return userIds.map((id) => byUserId.get(id) ?? []);
      }),
    };
  }
}
