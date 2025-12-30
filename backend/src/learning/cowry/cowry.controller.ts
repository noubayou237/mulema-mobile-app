import { Controller, Get, Patch, Param } from '@nestjs/common';
import { CowryService } from './cowry.service';

@Controller('cowries')
export class CowryController {
  constructor(private readonly cowryService: CowryService) {}

  @Get(':userId')
  getStatus(@Param('userId') userId: string) {
    return this.cowryService.getStatus(userId);
  }

  @Patch('lose/:userId')
  lose(@Param('userId') userId: string) {
    return this.cowryService.loseCowry(userId);
  }
}
