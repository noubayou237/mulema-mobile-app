import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './auth/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule  } from '@nestjs/schedule';

import { LanguageModule } from './language/language.module';
import { LearningModule } from './learning/learning.module';

@Module({
  imports: [
    ScheduleModule .forRoot(),
    PrismaModule,
    AuthModule,
    LanguageModule,
    LearningModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
