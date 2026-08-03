import { Request, Response } from 'express';
import { DataLoaders } from './dataloader/dataloader.types';

export interface GraphQLContext {
  req: Request;
  res: Response;
  /** Per-request DataLoader instances that batch relation fetches (N+1 fix). */
  dataloaders: DataLoaders;
}
