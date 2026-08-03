import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttachmentInput } from './dto/create-attachment.input';

@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(uploadedById: string, input: CreateAttachmentInput) {
    const task = await this.prisma.task.findUnique({
      where: { id: input.taskId },
    });
    if (!task) {
      throw new NotFoundException(`Task ${input.taskId} not found`);
    }

    return this.prisma.attachment.create({
      data: { ...input, uploadedById },
    });
  }

  async findOne(id: string) {
    const attachment = await this.prisma.attachment.findUnique({ where: { id } });
    if (!attachment) {
      throw new NotFoundException(`Attachment ${id} not found`);
    }
    return attachment;
  }

  async remove(id: string) {
    const attachment = await this.findOne(id);
    await this.prisma.attachment.delete({ where: { id } });
    return attachment;
  }
}
