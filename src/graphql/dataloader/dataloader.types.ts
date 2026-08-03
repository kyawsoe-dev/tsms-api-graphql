import DataLoader from 'dataloader';
import {
  Attachment,
  Comment,
  Project,
  Subtask,
  Tag,
  Task,
  User,
} from '@prisma/client';

/**
 * Strongly typed collection of DataLoaders exposed through the GraphQL context.
 *
 * Every field resolver that resolves a "to-many" / "to-one" relation should use
 * one of these loaders instead of hitting Prisma directly. DataLoader batches
 * all requests for the same key that happen in a single tick into ONE query,
 * which eliminates the classic GraphQL N+1 problem.
 */
export interface DataLoaders {
  /** Task.assignees (explicit m2m via tbl_task_assignee) */
  taskAssignees: DataLoader<string, User[]>;
  /** Task.comments */
  taskComments: DataLoader<string, Comment[]>;
  /** Task.subtasks */
  taskSubtasks: DataLoader<string, Subtask[]>;
  /** Task.tags (explicit m2m via tbl_task_tag) */
  taskTags: DataLoader<string, Tag[]>;
  /** Task.attachments */
  taskAttachments: DataLoader<string, Attachment[]>;
  /** Task.project */
  taskProject: DataLoader<string, Project | null>;
  /** Task.createdBy */
  taskCreatedBy: DataLoader<string, User | null>;
  /** Lookup a task by id */
  taskById: DataLoader<string, Task | null>;
  /** Comment.author */
  commentAuthor: DataLoader<string, User | null>;
  /** Project.tasks */
  projectTasks: DataLoader<string, Task[]>;
  /** Project.owner */
  projectOwner: DataLoader<string, User | null>;
  /** User.ownedProjects */
  userProjects: DataLoader<string, Project[]>;
  /** Attachment.uploadedBy */
  attachmentUploader: DataLoader<string, User | null>;
}
