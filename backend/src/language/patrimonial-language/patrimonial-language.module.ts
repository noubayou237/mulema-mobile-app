import { Module } from '@nestjs/common';
import { PatrimonialLanguageService } from './patrimonial-language.service';
import { PatrimonialLanguageController } from './patrimonial-language.controller';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [PatrimonialLanguageService],
  controllers: [PatrimonialLanguageController],
})
export class PatrimonialLanguageModule {}
