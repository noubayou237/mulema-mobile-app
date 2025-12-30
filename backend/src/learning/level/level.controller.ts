import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { LevelService } from './level.service';
import { CreateLevelDto } from './dto/create-level.dto';

@Controller('levels')
export class LevelController {
  constructor(private readonly service: LevelService) {}

  @Post()
  create(@Body() dto: CreateLevelDto) {
    return this.service.create(dto);
  }

  @Get('language/:id')
  findByLanguage(@Param('id') languageId: string) {
    return this.service.findByLanguage(languageId);
  }
}
