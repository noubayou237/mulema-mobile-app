import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Increase JSON payload limit for file uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Enable CORS for mobile apps
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation for DTOs
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Mulema API')
    .setDescription("Documentation de l'API pour l'application Mulema")
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Listen on port 5001, bind to all interfaces
  const port = process.env.PORT ?? 5001;
  const host = process.env.HOST ?? '0.0.0.0';
  await app.listen(port, host);

  console.log(`🚀 Backend running on http://${host}:${port}`);
  console.log(`📚 API docs: http://${host}:${port}/api`);
}
bootstrap();
