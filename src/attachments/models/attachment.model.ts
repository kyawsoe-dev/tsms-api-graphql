import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';
import { Task } from '../../tasks/models/task.model';
import { User } from '../../users/models/user.model';

@ObjectType()
export class Attachment {
  @Field(() => String)
  id: string;

  @Field(() => String)
  fileName: string;

  @Field(() => String)
  mimeType: string;

  @Field(() => Int)
  size: number;

  @Field(() => String)
  url: string;

  @Field(() => String)
  taskId: string;

  @Field(() => Task, { nullable: true })
  task?: Task;

  @Field(() => String)
  uploadedById: string;

  @Field(() => User, { nullable: true })
  uploadedBy?: User;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;
}
