import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';
import { Priority } from '../../common/enums/priority.enum';
import { Status } from '../../common/enums/status.enum';
import { Attachment } from '../../attachments/models/attachment.model';
import { Comment } from '../../comments/models/comment.model';
import { Project } from '../../projects/models/project.model';
import { Subtask } from '../../subtasks/models/subtask.model';
import { Tag } from '../../tags/models/tag.model';
import { User } from '../../users/models/user.model';

@ObjectType()
export class Task {
  @Field(() => String)
  id: string;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => Status)
  status: Status;

  @Field(() => Priority)
  priority: Priority;

  @Field(() => GraphQLISODateTime, { nullable: true })
  dueDate?: Date | null;

  @Field(() => Int)
  order: number;

  @Field(() => String)
  projectId: string;

  @Field(() => Project, { nullable: true })
  project?: Project;

  @Field(() => String)
  createdById: string;

  @Field(() => User, { nullable: true })
  createdBy?: User;

  @Field(() => [User], { nullable: true })
  assignees?: User[];

  @Field(() => [Subtask], { nullable: true })
  subtasks?: Subtask[];

  @Field(() => [Comment], { nullable: true })
  comments?: Comment[];

  @Field(() => [Tag], { nullable: true })
  tags?: Tag[];

  @Field(() => [Attachment], { nullable: true })
  attachments?: Attachment[];

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
