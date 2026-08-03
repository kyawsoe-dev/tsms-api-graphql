import { Module } from '@nestjs/common';
import { AttachmentsResolver } from './attachments.resolver';
import { AttachmentsService } from './attachments.service';

@Module({
  providers: [AttachmentsService, AttachmentsResolver],
})
export class AttachmentsModule {}
