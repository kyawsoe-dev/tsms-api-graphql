import { registerEnumType } from '@nestjs/graphql';
import { Status } from '@prisma/client';

// Register Prisma's own enum object as the GraphQL `Status` enum. Re-using the
// generated enum keeps the TS type of every model field identical to what
// Prisma returns, so no manual mapping or casts are needed anywhere.
registerEnumType(Status, {
  name: 'Status',
  description: 'Lifecycle stage of a task',
});

export { Status };
