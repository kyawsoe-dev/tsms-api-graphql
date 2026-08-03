import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreateSubtaskInput {
  @Field(() => String)
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @Field(() => String)
  @IsString()
  taskId: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  order?: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  done?: boolean;
}
