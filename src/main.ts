import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger/swagger.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOrigins =
    process.env.CORS_ORIGIN?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? true;

  app.enableCors({ origin: corsOrigins, credentials: true });

  // Global validation for all GraphQL input DTOs (class-validator).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  setupSwagger(app);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`GraphQL server ready at http://localhost:${port}/graphql`);
  console.log(`Subscriptions ready at ws://localhost:${port}/graphql`);
}

void bootstrap();
