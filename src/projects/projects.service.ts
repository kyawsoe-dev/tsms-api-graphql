import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectInput } from './dto/create-project.input';
import { UpdateProjectInput } from './dto/update-project.input';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  create(ownerId: string, input: CreateProjectInput) {
    return this.prisma.project.create({
      data: { ...input, ownerId },
    });
  }

  findAll(ownerId: string, skip: number, take: number) {
    return this.prisma.project.findMany({
      where: { ownerId },
      skip,
      take,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(ownerId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, ownerId },
    });
    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return project;
  }

  async update(ownerId: string, id: string, input: UpdateProjectInput) {
    await this.findOne(ownerId, id);
    return this.prisma.project.update({
      where: { id },
      data: input,
    });
  }

  async remove(ownerId: string, id: string) {
    await this.findOne(ownerId, id);
    // Cascades to all tasks, subtasks, comments and attachments in the DB.
    return this.prisma.project.delete({ where: { id } });
  }
}
