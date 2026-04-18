// src/learning/progress/progress.controller.ts

import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('progress')
@ApiBearerAuth()
@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  /**
   * 🔹 Initialiser la progression d'un utilisateur pour un thème (Mulem)
   */
  @Post('init/theme/:themeId')
  @ApiOperation({ summary: 'Initialiser la progression pour un thème' })
  async initMulemProgress(@Req() req: any, @Param('themeId') themeId: string) {
    const userId = req.user.userId;
    return this.progressService.initializeMulemProgress(userId, themeId);
  }

  /**
   * 🔹 Get user progress for a theme
   */
  @Get('theme/:themeId')
  @ApiOperation({ summary: 'Get user progress for a theme' })
  async getThemeProgress(@Req() req: any, @Param('themeId') themeId: string) {
    const userId = req.user.userId;
    return this.progressService.getProgressForTheme(userId, themeId);
  }

  /**
   * 🔹 Legacy: Get user progress for a level
   * (Now points to getProgressForTheme for unification)
   */
  @Get('level/:levelId')
  @ApiOperation({ summary: 'Get user progress for a level' })
  async getProgress(@Req() req: any, @Param('levelId') levelId: string) {
    const userId = req.user.userId;
    return this.progressService.getProgressForTheme(userId, levelId);
  }

  /**
   * 🔹 Valider une leçon Mulem (MulemWord)
   */
  @Post('complete/mulem')
  @ApiOperation({ summary: 'Marquer un mot Mulem comme complété' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        wordId: { type: 'string' },
        stars: { type: 'number', enum: [1, 2, 3] },
      },
    },
  })
  async completeMulemWord(
    @Req() req: any,
    @Body() body: { wordId: string; stars: number },
  ) {
    const userId = req.user.userId;
    return this.progressService.completeMulemWord(userId, body.wordId, body.stars);
  }

  /**
   * 🔹 Valider une leçon (Legacy)
   */
  @Post('complete')
  @ApiOperation({ summary: 'Marquer une leçon comme complétée' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        lessonId: { type: 'string' },
        stars: { type: 'number', enum: [1, 2, 3] },
      },
    },
  })
  async completeLesson(
    @Req() req: any,
    @Body() body: { lessonId: string; stars: number },
  ) {
    const userId = req.user.userId;
    try {
      // Tenter de compléter dans le nouveau système d'abord
      return await this.progressService.completeMulemWord(userId, body.lessonId, body.stars);
    } catch {
      // Fallback au legacie si ID non trouvé dans MulemWord
      return this.progressService.completeLesson(userId, body.lessonId, body.stars);
    }
  }
}
