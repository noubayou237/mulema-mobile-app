import { Module } from '@nestjs/common';
import { OfficialLanguageService } from './official-language.service';
import { OfficialLanguageController } from './official-language.controller';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [OfficialLanguageService],
  controllers: [OfficialLanguageController],
})
export class OfficialLanguageModule {}
