import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { AppResolver } from './app.resolver';
import { AttachmentsModule } from './attachments/attachments.module';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { DataloaderModule } from './graphql/dataloader/dataloader.module';
import { DataloaderProvider } from './graphql/dataloader/dataloader.provider';
import { GqlThrottlerGuard } from './graphql/guards/gql-throttler.guard';
import { PubSubModule } from './graphql/pubsub/pubsub.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { SubtasksModule } from './subtasks/subtasks.module';
import { TagsModule } from './tags/tags.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [DataloaderModule],
      inject: [DataloaderProvider],
      useFactory: (dataloaderProvider: DataloaderProvider) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.graphql'),
        sortSchema: true,
        playground: process.env.GRAPHQL_PLAYGROUND !== 'false',
        // graphql-ws transport for subscriptions (Apollo Server 4).
        subscriptions: { 'graphql-ws': true },
        // Fresh DataLoaders per request solve N+1 on relation fields.
        context: ({ req, res }) => ({
          req,
          res,
          dataloaders: dataloaderProvider.getLoaders(),
        }),
      }),
    }),
    ThrottlerModule.forRootAsync({
      // Per-IP limit across all HTTP GraphQL operations (see .env.example).
      useFactory: () => ({
        throttlers: [
          {
            // Env values are in seconds; @nestjs/throttler v6 expects ms.
            ttl: Number(process.env.THROTTLE_TTL ?? 60) * 1000,
            limit: Number(process.env.THROTTLE_LIMIT ?? 100),
          },
        ],
      }),
    }),
    PrismaModule,
    DataloaderModule,
    PubSubModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    SubtasksModule,
    CommentsModule,
    TagsModule,
    AttachmentsModule,
    HealthModule,
  ],
  providers: [
    AppResolver,
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
  ],
})
export class AppModule {}
