import { Module } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { ExerciseController } from './exercise.controller';
import { PrismaService } from '../../auth/prisma/prisma.service';
import { LessonModule } from '../lesson/lesson.module';


@Module({
  imports: [LessonModule],
  controllers: [ExerciseController],
  providers: [ExerciseService, PrismaService],

})
export class ExerciseModule {}
