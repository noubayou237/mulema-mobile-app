import { Controller, Post, Body, Get, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { ExerciseEngineService } from './exercise-engine.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class ExerciseController {
  constructor(
    private readonly exerciseService: ExerciseService,
    private readonly exerciseEngineService: ExerciseEngineService,
  ) {}

  @Post()
  create(@Body() dto: CreateExerciseDto) {
    return this.exerciseService.create(dto);
  }

  @Get('lesson/:id')
  findByLesson(@Param('id') id: string) {
    return this.exerciseService.findByLesson(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exerciseService.findOne(id);
  }

  @Patch(':id/complete')
  completeExercise(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: { accuracy: number; timeSpent: number },
  ) {
    return this.exerciseService.completeExercise(
      id,
      req.user.userId,
      body.accuracy,
      body.timeSpent,
    );
  }

  // =====================
  // Exercise Engine Endpoints
  // =====================

  @Get('block/:blockId/generate')
  generateBlockExercises(@Param('blockId') blockId: string) {
    return this.exerciseEngineService.generateBlockExercises(blockId);
  }

  @Get('theme/:themeId/generate')
  generateThemeExercises(@Param('themeId') themeId: string) {
    return this.exerciseEngineService.generateThemeExercises(themeId);
  }

  @Get('review/me')
  getWordsForReview(@Req() req: any) {
    return this.exerciseEngineService.getWordsForReview(req.user.userId);
  }

  @Post('word-progress')
  updateWordProgress(
    @Req() req: any,
    @Body() body: { wordId: string; isCorrect: boolean },
  ) {
    return this.exerciseEngineService.updateWordProgress(
      req.user.userId,
      body.wordId,
      body.isCorrect,
    );
  }
}
