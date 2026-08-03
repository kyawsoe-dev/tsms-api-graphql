import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Generates `src/schema.graphql` (the Code First auto schema file) WITHOUT
 * requiring a running PostgreSQL instance.
 *
 * The GraphQLModule writes the schema file during `app.init()`. Prisma is
 * overridden with a stub so nothing tries to connect to the database, which
 * makes this script safe to run in CI or before `graphql-codegen`.
 *
 * Usage: npm run schema:generate
 */
async function main() {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService)
    .useValue({})
    .compile();

  const app = moduleRef.createNestApplication();
  await app.init();
  await app.close();

  console.log('Generated src/schema.graphql');
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
