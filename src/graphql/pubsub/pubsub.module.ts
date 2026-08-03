import { Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

/**
 * Single shared PubSub instance across the whole application so that
 * mutations published from any module are received by every subscription.
 */
export const PUB_SUB = 'PUB_SUB';

@Module({
  providers: [{ provide: PUB_SUB, useValue: new PubSub() }],
  exports: [PUB_SUB],
})
export class PubSubModule {}
