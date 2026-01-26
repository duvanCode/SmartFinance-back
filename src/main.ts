import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './shared/infrastructure/filters/http-exception.filter';
import { winstonConfig } from './shared/infrastructure/logging/winston.config';

async function bootstrap() {
  // Create app with Winston logger
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig()),
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || 3000;
  const apiPrefix = configService.get<string>('app.apiPrefix') || 'api';
  const apiVersion = configService.get<string>('app.apiVersion') || 'v1';
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  const logger = new Logger('Bootstrap');

  // Debug DB connection (Safe logging - hides password)
  const dbUrl = configService.get<string>('DATABASE_URL');
  const dbUser = configService.get<string>('DB_USER');
  const dbName = configService.get<string>('DB_NAME');
  const dbHost = configService.get<string>('DB_HOST');
  const dbPort = configService.get<string>('DB_PORT');

  if (dbUrl) {
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
    logger.log(`Database URL: ${maskedUrl}`);
  } else {
    logger.warn('DATABASE_URL is not defined in environment variables');
  }

  logger.log(`DB Config -> User: ${dbUser}, Name: ${dbName}, Host: ${dbHost}, Port: ${dbPort}`);

  // Global prefix (exclude health endpoints)
  app.setGlobalPrefix(`${apiPrefix}/${apiVersion}`, {
    exclude: ['health', 'health/live', 'health/ready'],
  });

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger configuration (only in non-production or if explicitly enabled)
  if (!isProduction || configService.get<boolean>('SWAGGER_ENABLED')) {
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
      .addTag('Health', 'Health check endpoints')
      .addTag('Auth', 'Authentication endpoints - Google OAuth login and user profile')
      .addTag('Categories', 'Category management for income and expense classification')
      .addTag('Transactions', 'Transaction management - income and expense tracking')
      .addTag('Budgets', 'Budget management for spending limits')
      .addTag('Analytics', 'Financial analytics and reporting')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

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
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  app.enableCors({
    origin: corsOrigin ? corsOrigin.split(',').map(o => o.trim()) : '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Page-Size'],
  });

  await app.listen(port);

  const protocol = isProduction ? 'https' : 'http';
  const host = isProduction ? configService.get<string>('DOMAIN') || 'localhost' : 'localhost';
  const displayPort = isProduction ? '' : `:${port}`;

  logger.log(`Application is running on: ${protocol}://${host}${displayPort}/${apiPrefix}/${apiVersion}`);
  logger.log(`Health check: ${protocol}://${host}${displayPort}/health`);
  if (!isProduction || configService.get<boolean>('SWAGGER_ENABLED')) {
    logger.log(`Swagger documentation: ${protocol}://${host}${displayPort}/docs`);
  }
}

bootstrap();
