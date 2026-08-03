import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { Task } from '../../tasks/models/task.model';
import { User } from '../../users/models/user.model';

@ObjectType()
export class Comment {
  @Field(() => String)
  id: string;

  @Field(() => String)
  body: string;

  @Field(() => String)
  taskId: string;

  @Field(() => Task, { nullable: true })
  task?: Task;

  @Field(() => String)
  authorId: string;

  @Field(() => User, { nullable: true })
  author?: User;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
