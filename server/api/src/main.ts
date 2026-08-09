import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Custom Forms API')
    .setDescription('API for managing schemas (forms, pages, dashboards) and users')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  const port = process.env['PORT'] ?? 3000;
  await app.listen(port);
  Logger.log(`API running at http://localhost:${port}/api`);
  Logger.log(`Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
