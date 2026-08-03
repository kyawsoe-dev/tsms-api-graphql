import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { Task } from '../../tasks/models/task.model';
import { User } from '../../users/models/user.model';

@ObjectType()
export class Project {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  color?: string | null;

  @Field(() => String)
  ownerId: string;

  @Field(() => User, { nullable: true })
  owner?: User;

  @Field(() => [Task], { nullable: true })
  tasks?: Task[];

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
