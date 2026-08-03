import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagInput } from './dto/create-tag.input';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.tag.findMany({ orderBy: { name: 'asc' } });
  }

  create(input: CreateTagInput) {
    return this.prisma.tag.create({
      data: { name: input.name, color: input.color ?? '#6366f1' },
    });
  }

  async remove(id: string) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw new NotFoundException(`Tag ${id} not found`);
    }
    // Disconnects from all tasks automatically (implicit m2m), then deletes.
    return this.prisma.tag.delete({ where: { id } });
  }
}
