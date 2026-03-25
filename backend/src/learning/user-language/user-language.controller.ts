import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserLanguageService } from './user-language.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('user-languages')
@ApiBearerAuth()
@Controller('user-languages')
@UseGuards(JwtAuthGuard)
export class UserLanguageController {
  constructor(private readonly userLanguageService: UserLanguageService) {}

  /**
   * Get all languages user is learning
   */
  @Get()
  @ApiOperation({ summary: 'Get all languages user is learning' })
  async getUserLanguages(@Req() req: any) {
    return this.userLanguageService.getUserLanguages(req.user.userId);
  }

  /**
   * Get available languages to add
   */
  @Get('available')
  @ApiOperation({ summary: 'Get available languages to add' })
  async getAvailableLanguages() {
    return this.userLanguageService.getAvailableLanguages();
  }

  /**
   * Add a language to user's learning list
   */
  @Post()
  @ApiOperation({ summary: 'Add a language to learning list' })
  async addLanguage(
    @Req() req: any,
    @Body()
    body: { officialLanguageId?: string; patrimonialLanguageId?: string },
  ) {
    return this.userLanguageService.addLanguage(req.user.userId, body);
  }

  /**
   * Remove a language from user's learning list
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Remove a language from learning list' })
  async removeLanguage(@Req() req: any, @Param('id') languageId: string) {
    return this.userLanguageService.removeLanguage(req.user.userId, languageId);
  }
}
