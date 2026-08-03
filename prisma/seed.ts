import { PrismaClient, Priority, Status } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // Users
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice Johnson',
      password: passwordHash,
      avatarUrl: 'https://i.pravatar.cc/150?u=alice',
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      name: 'Bob Smith',
      password: passwordHash,
      avatarUrl: 'https://i.pravatar.cc/150?u=bob',
    },
  });

  // Tags
  const [feature, bug, design] = await Promise.all([
    prisma.tag.upsert({ where: { name: 'feature' }, update: {}, create: { name: 'feature', color: '#10b981' } }),
    prisma.tag.upsert({ where: { name: 'bug' }, update: {}, create: { name: 'bug', color: '#ef4444' } }),
    prisma.tag.upsert({ where: { name: 'design' }, update: {}, create: { name: 'design', color: '#8b5cf6' } }),
  ]);

  // Project
  const project = await prisma.project.upsert({
    where: { id: 'seed-project' },
    update: { name: 'Website Redesign' },
    create: {
      id: 'seed-project',
      name: 'Website Redesign',
      description: 'Rebuild the marketing site with the new design system.',
      color: '#6366f1',
      ownerId: alice.id,
    },
  });

  // Tasks (with explicit ids so the frontend seed has a stable reference)
  const tasks = [
    {
      id: 'seed-task-1',
      title: 'Set up design system',
      description: 'Tokens, color palette and typography scale.',
      status: Status.DONE,
      priority: Priority.HIGH,
      order: 0,
      projectId: project.id,
      createdById: alice.id,
      assignees: [alice.id],
      tags: [design.id],
    },
    {
      id: 'seed-task-2',
      title: 'Build landing page hero',
      description: 'Responsive hero section with new illustration.',
      status: Status.IN_PROGRESS,
      priority: Priority.URGENT,
      order: 1,
      projectId: project.id,
      createdById: alice.id,
      assignees: [bob.id],
      tags: [feature.id],
    },
    {
      id: 'seed-task-3',
      title: 'Fix mobile nav overlap',
      description: 'The hamburger menu overlaps the logo on small screens.',
      status: Status.TODO,
      priority: Priority.HIGH,
      order: 2,
      projectId: project.id,
      createdById: bob.id,
      assignees: [bob.id],
      tags: [bug.id],
    },
    {
      id: 'seed-task-4',
      title: 'Write launch blog post',
      description: 'Announce the redesign on the company blog.',
      status: Status.BACKLOG,
      priority: Priority.LOW,
      order: 3,
      projectId: project.id,
      createdById: alice.id,
      assignees: [],
      tags: [],
    },
  ];

  for (const t of tasks) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: {
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        assignees: { deleteMany: {} },
        tags: { deleteMany: {} },
      },
      create: {
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        order: t.order,
        projectId: t.projectId,
        createdById: t.createdById,
        assignees: { create: t.assignees.map((userId) => ({ userId })) },
        tags: { create: t.tags.map((tagId) => ({ tagId })) },
      },
    });
  }

  // Subtasks + comments for the in-progress task
  await prisma.subtask.upsert({
    where: { id: 'seed-sub-1' },
    update: { done: true },
    create: { id: 'seed-sub-1', title: 'Draft copy', taskId: 'seed-task-2', order: 0, done: true },
  });
  await prisma.subtask.upsert({
    where: { id: 'seed-sub-2' },
    update: {},
    create: { id: 'seed-sub-2', title: 'Build responsive layout', taskId: 'seed-task-2', order: 1 },
  });
  await prisma.subtask.upsert({
    where: { id: 'seed-sub-3' },
    update: {},
    create: { id: 'seed-sub-3', title: 'Animate illustrations', taskId: 'seed-task-2', order: 2 },
  });

  await prisma.comment.upsert({
    where: { id: 'seed-comment-1' },
    update: {},
    create: {
      id: 'seed-comment-1',
      body: 'Let me know once the hero is ready for review.',
      taskId: 'seed-task-2',
      authorId: alice.id,
    },
  });

  await prisma.attachment.upsert({
    where: { id: 'seed-attach-1' },
    update: {},
    create: {
      id: 'seed-attach-1',
      fileName: 'hero-mockup.png',
      mimeType: 'image/png',
      size: 204800,
      url: 'https://picsum.photos/seed/hero-mockup.png',
      taskId: 'seed-task-2',
      uploadedById: bob.id,
    },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
