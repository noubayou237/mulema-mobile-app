import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    const maxRetries = 5;
    const retryDelayMs = 3000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.$connect();
        this.logger.log('Database connected successfully');
        return;
      } catch (err: any) {
        const isLastAttempt = attempt === maxRetries;
        if (isLastAttempt) throw err;

        this.logger.warn(
          `DB connection attempt ${attempt}/${maxRetries} failed (${err?.errorCode ?? err?.code ?? 'unknown'}). ` +
          `Retrying in ${retryDelayMs / 1000}s... (Neon may be waking up)`,
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

