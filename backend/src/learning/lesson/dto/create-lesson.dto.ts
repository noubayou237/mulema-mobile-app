// src/learning/lesson/dto/create-lesson.dto.ts

import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateLessonDto {
  /**
   * 📘 Titre de la leçon
   */
  @IsString()
  @IsNotEmpty()
  title: string;

  /**
   * 🔢 Ordre d'affichage dans le level
   * (commence généralement à 1)
   */
  @IsInt()
  @Min(1)
  order: number;

  /**
   * 🔗 Contenu pédagogique
   * (vidéo, audio ou page HTML)
   */
  @IsOptional()
  @IsUrl()
  contentUrl?: string;

  /**
   * 🧱 Level auquel appartient la leçon
   */
  @IsString()
  @IsNotEmpty()
  levelId: string;
}
