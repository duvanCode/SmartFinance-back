import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';
import appConfig from './shared/infrastructure/config/app.config';
import databaseConfig from './shared/infrastructure/config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    // Feature modules will be added here
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
