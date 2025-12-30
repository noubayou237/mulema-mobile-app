import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';

@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  create(@Body() dto: CreateQuestionDto) {
    return this.questionService.create(dto);
  }

  @Get('exercise/:id')
  findByExercise(@Param('id') id: string) {
    return this.questionService.findByExercise(id);
  }
}
