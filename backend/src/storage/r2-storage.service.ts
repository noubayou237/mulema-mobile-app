import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';

export interface UploadedFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface StorageResult {
  url: string;
  key: string;
}

@Injectable()
export class R2StorageService {
  private readonly logger = new Logger(R2StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;
  private readonly region: string;

  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>('R2_REGION') || 'auto';
    this.bucketName =
      this.configService.get<string>('R2_BUCKET_NAME') || 'mulema-avatars';
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL') || '';

    this.s3Client = new S3Client({
      region: this.region,
      endpoint: this.configService.get<string>('R2_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get<string>('R2_ACCESS_KEY_ID') || '',
        secretAccessKey:
          this.configService.get<string>('R2_SECRET_ACCESS_KEY') || '',
      },
    });

    this.logger.log(`R2 Storage initialized with bucket: ${this.bucketName}`);
  }

  /**
   * Upload a file to Cloudflare R2
   */
  async uploadFile(
    file: UploadedFile,
    folder: string = 'avatars',
  ): Promise<StorageResult> {
    try {
      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.',
        );
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new BadRequestException('File size must be less than 5MB');
      }

      // Generate unique key
      const ext = file.originalname.split('.').pop() || 'jpg';
      const key = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

      // Upload using simple PutObjectCommand (works better with buffers)
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      const url = this.publicUrl
        ? `${this.publicUrl}/${key}`
        : `/uploads/${key}`;

      this.logger.log(`File uploaded successfully: ${key}`);

      return { url, key };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to upload file: ${errorMessage}`);
      throw new BadRequestException(`Failed to upload file: ${errorMessage}`);
    }
  }

  /**
   * Delete a file from Cloudflare R2
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to delete file: ${errorMessage}`);
      throw new BadRequestException(`Failed to delete file: ${errorMessage}`);
    }
  }

  /**
   * Get a file from R2 and return as buffer
   */
  async getFile(key: string): Promise<{ buffer: Buffer; contentType: string }> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error('Empty response body');
      }

      // Convert the stream to buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      return {
        buffer,
        contentType: response.ContentType || 'image/jpeg',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get file: ${errorMessage}`);
      throw new BadRequestException(`Failed to get file: ${errorMessage}`);
    }
  }

  /**
   * Get a signed URL for private files
   * Signed URLs expire after the specified duration
   */
  async getSignedUrl(
    key: string,
    expiresInSeconds: number = 3600,
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: expiresInSeconds,
      });

      this.logger.log(`Generated signed URL for: ${key}`);
      return signedUrl;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to generate signed URL: ${errorMessage}`);
      throw new BadRequestException(
        `Failed to generate signed URL: ${errorMessage}`,
      );
    }
  }

  /**
   * Extract key from URL or path
   */
  extractKey(urlOrPath: string): string {
    // If it's a full URL, extract the path after the bucket/domain
    if (urlOrPath.startsWith('http')) {
      const url = new URL(urlOrPath);
      return url.pathname.replace(/^\//, '');
    }
    // If it's a path like /uploads/avatars/filename, extract the key
    return urlOrPath.replace(/^\/?uploads\//, '');
  }
}
