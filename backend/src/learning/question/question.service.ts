import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../auth/prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateQuestionDto) {
    return this.prisma.question.create({
      data: dto,
    });
  }

  findByExercise(exerciseId: string) {
    return this.prisma.question.findMany({
      where: { exerciseId },
    });
  }
}
