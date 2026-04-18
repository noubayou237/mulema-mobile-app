import { Controller, Post, Body, Get, Param, UseGuards, Req } from '@nestjs/common';
import { LevelService } from './level.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('levels')
@UseGuards(JwtAuthGuard)
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

  @Get('themes/language/:id')
  findThemesByLanguage(@Req() req: any, @Param('id') languageId: string) {
    const userId = req.user.userId;
    return this.service.findThemesByLanguage(languageId, userId);
  }

  @Get(':themeId/words')
  getThemeWords(@Req() req: any, @Param('themeId') themeId: string) {
    const userId = req.user.userId;
    return this.service.getThemeWords(themeId, userId);
  }
}
