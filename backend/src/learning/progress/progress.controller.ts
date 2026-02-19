// src/learning/progress/progress.controller.ts

import { Body, Controller, Post, Param, Req, UseGuards } from '@nestjs/common';
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
   * 🔹 Initialiser la progression d’un utilisateur pour un level
   * (appelé une seule fois)
   */
  @Post('init/:levelId')
  @ApiOperation({ summary: 'Initialiser la progression pour un niveau' })
  async initProgress(@Req() req: any, @Param('levelId') levelId: string) {
    const userId = req.user.userId;
    return this.progressService.initializeProgress(userId, levelId);
  }

  /**
   * 🔹 Valider une leçon
   * stars = 1 | 2 | 3
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
    @Body()
    body: {
      lessonId: string;
      stars: number;
    },
  ) {
    const userId = req.user.userId;
    return this.progressService.completeLesson(
      userId,
      body.lessonId,
      body.stars,
    );
  }
}
