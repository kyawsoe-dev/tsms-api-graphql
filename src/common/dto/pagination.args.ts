import { ArgsType, Field, Int } from '@nestjs/graphql';
import { Max, Min } from 'class-validator';

@ArgsType()
export class PaginationArgs {
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @Min(0)
  skip: number = 0;

  @Field(() => Int, { nullable: true, defaultValue: 50 })
  @Min(1)
  @Max(200)
  take: number = 50;
}
