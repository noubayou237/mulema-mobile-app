import { IsEnum, IsString, IsArray } from 'class-validator';
import { QuestionType } from '@prisma/client';

export class CreateQuestionDto {
  @IsString()
  content: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsString()
  correctAnswer: string;

  @IsArray()
  options: string[];

  @IsString()
  exerciseId: string;
}
