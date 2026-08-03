import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';
import { Task } from '../../tasks/models/task.model';

@ObjectType()
export class Subtask {
  @Field(() => String)
  id: string;

  @Field(() => String)
  title: string;

  @Field(() => Boolean)
  done: boolean;

  @Field(() => Int)
  order: number;

  @Field(() => String)
  taskId: string;

  @Field(() => Task, { nullable: true })
  task?: Task;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
