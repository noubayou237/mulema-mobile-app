import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateExerciseDto {
  @IsString()
  theme: string;

  @IsOptional()
  @IsString()
  lessonId?: string;

  @IsOptional()
  @IsString()
  storyId?: string;

  @IsOptional()
  @IsNumber()
  timeSpent?: number;

  @IsOptional()
  @IsNumber()
  accuracy?: number;
}
