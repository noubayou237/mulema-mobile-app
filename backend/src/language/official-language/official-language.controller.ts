import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { OfficialLanguageService } from './official-language.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('official-languages')
@ApiBearerAuth()
@Controller('official-languages')
export class OfficialLanguageController {
  constructor(private service: OfficialLanguageService) {}

  @Get()
  getAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: any) {
    return this.service.create(dto.name);
  }

  @ApiOperation({ summary: "Sélectionner une langue officielle pour l'utilisateur" })
  @ApiBody({ schema: { type: 'object', properties: { officialLanguageId: { type: 'string' } } } })
  @Post('select')
  @UseGuards(JwtAuthGuard)
  select(@Req() req, @Body() dto: any) {
    return this.service.assignToUser(
      req.user.userId,
      dto.officialLanguageId,
    );
  }
}
