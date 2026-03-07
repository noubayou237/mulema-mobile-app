import { Module } from '@nestjs/common';
import { LevelModule } from './level/level.module';
import { LessonModule } from './lesson/lesson.module';
import { ProgressModule } from './progress/progress.module';
import { ExerciseModule } from './exercise/exercise.module';
import { QuestionModule } from './question/question.module';
import { StoryModule } from './story/story.module';
import { CowryModule } from './cowry/cowry.module';
import { UserLanguageModule } from './user-language/user-language.module';

@Module({
  imports: [
    LevelModule,
    LessonModule,
    ProgressModule,
    ExerciseModule,
    QuestionModule,
    StoryModule,
    CowryModule,
    UserLanguageModule,
  ],
})
export class LearningModule {}
