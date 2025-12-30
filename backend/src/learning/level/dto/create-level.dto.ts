import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLevelDto {
  @IsInt()
  levelNumber: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsNotEmpty()
  patrimonialLanguageId: string;
}
