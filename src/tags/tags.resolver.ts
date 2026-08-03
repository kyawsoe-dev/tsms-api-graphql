import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CreateTagInput } from './dto/create-tag.input';
import { Tag } from './models/tag.model';
import { TagsService } from './tags.service';

@Resolver(() => Tag)
export class TagsResolver {
  constructor(private readonly tagsService: TagsService) {}

  @Query(() => [Tag])
  @UseGuards(GqlAuthGuard)
  async tags(): Promise<Tag[]> {
    return this.tagsService.findAll();
  }

  @Mutation(() => Tag)
  @UseGuards(GqlAuthGuard)
  async createTag(@Args('input') input: CreateTagInput): Promise<Tag> {
    return this.tagsService.create(input);
  }

  @Mutation(() => Tag)
  @UseGuards(GqlAuthGuard)
  async deleteTag(@Args('id', { type: () => String }) id: string): Promise<Tag> {
    return this.tagsService.remove(id);
  }
}
