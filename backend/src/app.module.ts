import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './auth/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

import { LanguageModule } from './language/language.module';
import { LearningModule } from './learning/learning.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    // 🔑 Variables d’environnement disponibles partout
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // ⏱️ Tâches planifiées
    ScheduleModule.forRoot(),

    // 🛡️ Rate Limiting (Global: 60 requests per minute per IP)
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),

    // 🔐 Auth & DB
    PrismaModule,
    AuthModule,
    UserModule,

    // 📚 Modules métier
    LanguageModule,
    LearningModule,

    // 📦 Storage
    StorageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
