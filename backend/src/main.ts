import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validate JWT secrets at startup
  if (!process.env.JWT_SECRET) {
    throw new Error('CRITICAL: JWT_SECRET environment variable is not defined!');
  }

  // Security Headers
  app.use(helmet());

  // Increase JSON payload limit for file uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Enable CORS for mobile apps
  app.enableCors({
    origin: [
      'https://mulema.app',
      'https://api.mulema.app',
      /^https?:\/\/localhost(:\d+)?$/,
      /^http:\/\/10\.0\.2\.2/, // Android emulator
      /^http:\/\/192\.168\./,   // Local network
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation for DTOs
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  // Swagger documentation (Only in development)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Mulema API')
      .setDescription("Documentation de l'API pour l'application Mulema")
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  // Listen on the port provided by Railway (or 5001 locally)
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5001;
  // Force 0.0.0.0 so the container receives connection routing from Railway's load balancer
  await app.listen(port, '0.0.0.0');

}
bootstrap();
