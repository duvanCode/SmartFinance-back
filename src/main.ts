import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || 3000;
  const apiPrefix = configService.get<string>('app.apiPrefix') || 'api';
  const apiVersion = configService.get<string>('app.apiVersion') || 'v1';

  // Global prefix
  app.setGlobalPrefix(`${apiPrefix}/${apiVersion}`);

  // Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SmartFinance API')
    .setDescription('Personal finance management system with AI - REST API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication endpoints - Google OAuth login and user profile')
    .addTag('Categories', 'Category management for income and expense classification')
    .addTag('Transactions', 'Transaction management - income and expense tracking')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN') || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}/${apiVersion}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/docs`);
}

bootstrap();
