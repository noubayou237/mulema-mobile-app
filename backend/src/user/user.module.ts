import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../auth/prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { join } from 'path';

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    // Serve static files from uploads directory (for local development)
    // In production with R2, you would use a CDN or custom domain
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
