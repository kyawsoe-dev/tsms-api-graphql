import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * OpenAPI (Swagger) docs for the REST surface of the API.
 *
 * Controlled via env vars:
 *   SWAGGER_ENABLED  set to `false` to disable
 *   SWAGGER_PATH     mount path, default `/docs`
 */
export function setupSwagger(app: INestApplication): void {
  if (process.env.SWAGGER_ENABLED === 'false') {
    return;
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Task Management API')
    .setDescription(
      'NestJS GraphQL (Code First) + Prisma + PostgreSQL backend.\n\n' +
        'Primary endpoint: `POST /graphql` (Apollo Server, Playground at ' +
        '`/graphql`). This UI documents the REST surface (health probe); ' +
        'all domain data is exposed over GraphQL.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('health')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  const swaggerPath = process.env.SWAGGER_PATH ?? '/docs';
  SwaggerModule.setup(swaggerPath, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
  console.log(`Swagger docs ready at ${swaggerPath}`);
}
