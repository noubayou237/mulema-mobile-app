import { Module } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { ExerciseEngineService } from './exercise-engine.service';
import { ExerciseController } from './exercise.controller';
import { LessonModule } from '../lesson/lesson.module';

@Module({
  imports: [LessonModule], // ✅ OBLIGATOIRE
  controllers: [ExerciseController],
  providers: [ExerciseService, ExerciseEngineService],
  exports: [ExerciseEngineService],
})
export class ExerciseModule {}
