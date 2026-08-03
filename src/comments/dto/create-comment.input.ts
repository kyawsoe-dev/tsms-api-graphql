import { Field, InputType } from '@nestjs/graphql';
import { IsString, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreateCommentInput {
  @Field(() => String)
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  body: string;

  @Field(() => String)
  @IsString()
  taskId: string;
}
