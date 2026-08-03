import { Module } from '@nestjs/common';
import { PubSubModule } from '../graphql/pubsub/pubsub.module';
import { SubtasksResolver } from './subtasks.resolver';
import { SubtasksService } from './subtasks.service';

@Module({
  imports: [PubSubModule],
  providers: [SubtasksService, SubtasksResolver],
})
export class SubtasksModule {}
