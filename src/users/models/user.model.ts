import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { Project } from '../../projects/models/project.model';

@ObjectType()
export class User {
  @Field(() => String)
  id: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  avatarUrl?: string | null;

  @Field(() => [Project], { nullable: true })
  ownedProjects?: Project[];

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
