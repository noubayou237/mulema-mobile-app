import { Module } from '@nestjs/common';
import { OfficialLanguageModule } from './official-language/official-language.module';
import { PatrimonialLanguageModule } from './patrimonial-language/patrimonial-language.module';

@Module({
  imports: [OfficialLanguageModule, PatrimonialLanguageModule]
})
export class LanguageModule {}
