import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PatrimonialLanguageService } from './patrimonial-language.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('patrimonial-languages')
@ApiBearerAuth()
@Controller('patrimonial-languages')
export class PatrimonialLanguageController {
  constructor(private service: PatrimonialLanguageService) {}

  @Get()
  getAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: any) {
    // TODO: Protéger cette route (Admin uniquement)
    return this.service.create(dto.name);
  }

  @ApiOperation({ summary: "Sélectionner une langue patrimoniale pour l'utilisateur" })
  @ApiBody({ schema: { type: 'object', properties: { patrimonialLanguageId: { type: 'string' } } } })
  @Post('select')
  @UseGuards(JwtAuthGuard)
  select(@Req() req, @Body() dto: any) {
    return this.service.selectForUser(
      req.user.userId,
      dto.patrimonialLanguageId,
    );
  }
}
