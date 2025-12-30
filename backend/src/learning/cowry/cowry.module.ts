import { Module } from '@nestjs/common';
import { CowryService } from './cowry.service';
import { CowryController } from './cowry.controller';

@Module({
  providers: [CowryService],
  controllers: [CowryController]
})
export class CowryModule {}
