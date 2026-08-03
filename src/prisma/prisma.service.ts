import { execFile } from 'node:child_process';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ensureDatabaseExists } from './ensure-database';

const exec = promisify(execFile);

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    // Create the database on first boot so a fresh checkout can start before
    // `prisma migrate` has been run.
    const created = await ensureDatabaseExists();

    await this.$connect();

    // Apply the schema from prisma/schema.prisma when there are no tables yet:
    // either the database was just created, or it pre-existed but is empty
    // (e.g. an interrupted first boot). Cheap metadata check, dev convenience
    // only — production uses `prisma migrate deploy`.
    if (process.env.NODE_ENV !== 'production') {
      const isEmpty = await this.isDatabaseEmpty();
      if (created || isEmpty) {
        await this.applySchema();
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private async isDatabaseEmpty(): Promise<boolean> {
    const rows = await this.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'
    `;
    return Number(rows[0]?.count ?? 0) === 0;
  }

  /** Syncs tables via `prisma db push` (dev convenience, no migration files). */
  private async applySchema(): Promise<void> {
    const cli = join(process.cwd(), 'node_modules', 'prisma', 'build', 'index.js');
    try {
      await exec(process.execPath, [cli, 'db', 'push', '--skip-generate'], {
        env: process.env,
      });
      console.log('[schema] Tables created via `prisma db push`');
    } catch (error) {
      console.error('[schema] `prisma db push` failed:', error);
    }
  }
}
