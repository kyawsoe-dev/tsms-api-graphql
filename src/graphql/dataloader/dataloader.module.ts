import { Module } from '@nestjs/common';
import { DataloaderProvider } from './dataloader.provider';

@Module({
  providers: [DataloaderProvider],
  exports: [DataloaderProvider],
})
export class DataloaderModule {}
