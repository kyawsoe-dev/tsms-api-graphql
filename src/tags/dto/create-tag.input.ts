import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreateTagInput {
  @Field(() => String)
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'color must be a hex value like #6366f1' })
  color?: string;
}
