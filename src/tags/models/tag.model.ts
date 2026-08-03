import { Field, ObjectType } from '@nestjs/graphql';
import { Task } from '../../tasks/models/task.model';

@ObjectType()
export class Tag {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { defaultValue: '#6366f1' })
  color: string;

  @Field(() => [Task], { nullable: true })
  tasks?: Task[];
}
