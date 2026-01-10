import { Module } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { ExerciseController } from './exercise.controller';
import { LessonModule } from '../lesson/lesson.module';

@Module({
  imports: [LessonModule], // ✅ OBLIGATOIRE
  controllers: [ExerciseController],
  providers: [ExerciseService],
})
export class ExerciseModule {}
