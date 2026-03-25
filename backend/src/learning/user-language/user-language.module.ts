import { Module } from '@nestjs/common';
import { UserLanguageService } from './user-language.service';
import { UserLanguageController } from './user-language.controller';
import { PrismaService } from '../../auth/prisma/prisma.service';

@Module({
  controllers: [UserLanguageController],
  providers: [UserLanguageService, PrismaService],
  exports: [UserLanguageService],
})
export class UserLanguageModule {}
