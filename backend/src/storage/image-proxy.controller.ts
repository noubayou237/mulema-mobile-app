import { Controller, Get, Res, Logger, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { R2StorageService } from './r2-storage.service';

@Controller('image')
export class ImageProxyController {
  private readonly logger = new Logger(ImageProxyController.name);

  constructor(private r2StorageService: R2StorageService) {}

  // =====================
  // PROXY IMAGE ENDPOINT - catch all routes
  // =====================
  @Get('*')
  async getImage(@Req() req: Request, @Res() res: Response) {
    // Extract the path from the URL (remove /image/ prefix)
    const fullPath = req.path;
    const path = fullPath.replace(/^\/?image\/?/, '');

    this.logger.log(
      `Proxy image request for path: ${path}, fullPath: ${fullPath}`,
    );

    if (!path) {
      res.status(404).send('Image path not specified');
      return;
    }

    try {
      this.logger.log(`Fetching from R2 with key: ${path}`);
      const { buffer, contentType } = await this.r2StorageService.getFile(path);
      this.logger.log(
        `Got buffer length: ${buffer.length}, contentType: ${contentType}`,
      );

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to get image: ${errorMessage}`, errorStack);
      res.status(404).send(`Image not found: ${errorMessage}`);
    }
  }
}
