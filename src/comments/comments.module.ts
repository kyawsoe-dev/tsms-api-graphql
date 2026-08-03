import { Module } from '@nestjs/common';
import { PubSubModule } from '../graphql/pubsub/pubsub.module';
import { CommentsResolver } from './comments.resolver';
import { CommentsService } from './comments.service';

@Module({
  imports: [PubSubModule],
  providers: [CommentsService, CommentsResolver],
})
export class CommentsModule {}
