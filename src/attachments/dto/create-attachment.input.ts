import { Field, Int, InputType } from '@nestjs/graphql';
import { IsInt, IsString, IsUrl, MaxLength, Min, MinLength } from 'class-validator';

/**
 * File upload is left out of scope (see README for the `graphql-upload` +
 * `FileUpload` scalar approach). This input accepts already-hosted file
 * metadata, e.g. from an S3 pre-signed URL flow.
 */
@InputType()
export class CreateAttachmentInput {
  @Field(() => String)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  fileName: string;

  @Field(() => String)
  @IsString()
  @MaxLength(100)
  mimeType: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  size: number;

  @Field(() => String)
  @IsUrl()
  url: string;

  @Field(() => String)
  @IsString()
  taskId: string;
}
