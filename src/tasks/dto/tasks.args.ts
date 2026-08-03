import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, Max, Min } from 'class-validator';
import { Priority } from '../../common/enums/priority.enum';
import { Status } from '../../common/enums/status.enum';

/**
 * NOTE: Intentionally does NOT extend PaginationArgs. NestJS GraphQL's
 * `@Args()` mapping only binds fields declared directly on the ArgsType
 * class — subclass fields (e.g. `projectId`) were silently dropped, so
 * task filters never reached the service. All fields are declared here.
 *
 * Every filter field MUST carry a class-validator decorator: the global
 * ValidationPipe runs with `whitelist: true`, which strips any property
 * without a validation decorator before the resolver sees it.
 */
@ArgsType()
export class TasksArgs {
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @Min(0)
  skip: number = 0;

  @Field(() => Int, { nullable: true, defaultValue: 50 })
  @Min(1)
  @Max(200)
  take: number = 50;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  projectId?: string;

  @Field(() => Status, { nullable: true })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @Field(() => Priority, { nullable: true })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  assigneeId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}
