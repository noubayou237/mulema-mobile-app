import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

/**
 * DTO for generating exercises for a block
 */
export class GenerateBlockExercisesDto {
  @IsString()
  blockId: string;
}

/**
 * DTO for generating exercises for a theme
 */
export class GenerateThemeExercisesDto {
  @IsString()
  themeId: string;
}

/**
 * DTO for updating word progress
 */
export class UpdateWordProgressDto {
  @IsString()
  userId: string;

  @IsString()
  wordId: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  isCorrect: number; // 0 or 1
}

/**
 * DTO for getting words for review
 */
export class GetWordsForReviewDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}
