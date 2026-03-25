import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { ExerciseEngineService } from './exercise-engine.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';

@Controller('exercises')
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
    @Body() body: { userId: string; accuracy: number; timeSpent: number },
  ) {
    return this.exerciseService.completeExercise(
      id,
      body.userId,
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

  @Get('review/:userId')
  getWordsForReview(@Param('userId') userId: string) {
    return this.exerciseEngineService.getWordsForReview(userId);
  }

  @Post('word-progress')
  updateWordProgress(
    @Body() body: { userId: string; wordId: string; isCorrect: boolean },
  ) {
    return this.exerciseEngineService.updateWordProgress(
      body.userId,
      body.wordId,
      body.isCorrect,
    );
  }
}
