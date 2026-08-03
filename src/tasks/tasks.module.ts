import { Module } from '@nestjs/common';
import { PubSubModule } from '../graphql/pubsub/pubsub.module';
import { TasksResolver } from './tasks.resolver';
import { TasksService } from './tasks.service';

@Module({
  imports: [PubSubModule],
  providers: [TasksService, TasksResolver],
  exports: [TasksService],
})
export class TasksModule {}
