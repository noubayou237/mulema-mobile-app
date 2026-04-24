// src/learning/lesson/lesson.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  /**
   * 🔹 Création d'une leçon (ADMIN)
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateLessonDto) {
    return this.lessonService.create(dto);
  }

  /**
   * 🔹 Récupérer les leçons d’un level
   * avec l’état de progression de l’utilisateur connecté
   */
  @UseGuards(JwtAuthGuard)
  @Get('level/:levelId')
  async getLessonsByLevel(@Param('levelId') levelId: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.lessonService.getLessonsWithProgress(levelId, userId);
  }
}
