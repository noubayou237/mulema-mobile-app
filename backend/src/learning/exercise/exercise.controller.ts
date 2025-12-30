import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';

@Controller('exercises')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

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

}
