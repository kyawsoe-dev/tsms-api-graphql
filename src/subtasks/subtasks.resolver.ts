import { UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { GraphQLContext } from '../graphql/context.interface';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { Task } from '../tasks/models/task.model';
import { CreateSubtaskInput } from './dto/create-subtask.input';
import { UpdateSubtaskInput } from './dto/update-subtask.input';
import { Subtask } from './models/subtask.model';
import { SubtasksService } from './subtasks.service';

@Resolver(() => Subtask)
export class SubtasksResolver {
  constructor(private readonly subtasksService: SubtasksService) {}

  @Mutation(() => Subtask)
  @UseGuards(GqlAuthGuard)
  async createSubtask(@Args('input') input: CreateSubtaskInput): Promise<Subtask> {
    return this.subtasksService.create(input);
  }

  @Mutation(() => Subtask)
  @UseGuards(GqlAuthGuard)
  async updateSubtask(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateSubtaskInput,
  ): Promise<Subtask> {
    return this.subtasksService.update(id, input);
  }

  @Mutation(() => Subtask)
  @UseGuards(GqlAuthGuard)
  async toggleSubtask(
    @Args('id', { type: () => String }) id: string,
    @Args('done', { type: () => Boolean }) done: boolean,
  ): Promise<Subtask> {
    return this.subtasksService.update(id, { done });
  }

  @Mutation(() => Subtask)
  @UseGuards(GqlAuthGuard)
  async deleteSubtask(@Args('id', { type: () => String }) id: string): Promise<Subtask> {
    return this.subtasksService.remove(id);
  }

  @ResolveField(() => Task, { nullable: true })
  async task(
    @Parent() subtask: Subtask,
    @Context() context: GraphQLContext,
  ): Promise<Task | null> {
    return context.dataloaders.taskById.load(subtask.taskId);
  }
}
