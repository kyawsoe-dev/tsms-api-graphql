import { registerEnumType } from '@nestjs/graphql';
import { Priority } from '@prisma/client';

registerEnumType(Priority, {
  name: 'Priority',
  description: 'Urgency level of a task',
});

export { Priority };
