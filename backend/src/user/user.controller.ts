import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { diskStorage } from 'multer';

interface AuthUser {
  userId: string;
  role: string;
}

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private userService: UserService) {}

  // =====================
  // GET PROFILE
  // =====================
  @Get('profile')
  async getProfile(@CurrentUser() user: AuthUser) {
    this.logger.log(`Get profile request for user: ${user.userId}`);
    return this.userService.getProfile(user.userId);
  }

  // =====================
  // UPDATE PROFILE
  // =====================
  @Put('profile')
  async updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() body: { name?: string; email?: string },
  ) {
    this.logger.log(`Update profile request for user: ${user.userId}`);
    return this.userService.updateProfile(user.userId, body);
  }

  // =====================
  // UPDATE PROFILE PICTURE
  // =====================
  @Put('profile-picture')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          // We'll handle filename in service
          cb(null, file.originalname);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
        ];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type'), false);
        }
      },
    }),
  )
  async uploadProfilePicture(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.logger.log(
      `Upload profile picture request for user: ${user.userId}, file: ${file?.originalname}`,
    );
    if (!file) {
      throw new Error('No file uploaded');
    }
    return this.userService.updateProfilePicture(user.userId, file);
  }

  // =====================
  // DELETE PROFILE PICTURE
  // =====================
  @Delete('profile-picture')
  async deleteProfilePicture(@CurrentUser() user: AuthUser) {
    this.logger.log(`Delete profile picture request for user: ${user.userId}`);
    return this.userService.deleteProfilePicture(user.userId);
  }
}
