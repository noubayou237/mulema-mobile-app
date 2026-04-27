import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../auth/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CowryService {
  constructor(private prisma: PrismaService) {}

  async loseCowry(userId: string) {
    const cowry = await this.prisma.cowry.findUnique({ where: { userId } });

    if (!cowry || cowry.currentCowries <= 0) {
      throw new BadRequestException('No cowries left');
    }

    return this.prisma.cowry.update({
      where: { userId },
      data: { currentCowries: cowry.currentCowries - 1 },
    });
  }

  async recharge(userId: string) {
    return this.prisma.cowry.update({
      where: { userId },
      data: { currentCowries: { increment: 1 } },
    });
  }

  getStatus(userId: string) {
    return this.prisma.cowry.findUnique({ where: { userId } });
  }

  @Cron('*/9 * * * *')
  async rechargeCowries() {
    if (process.env.NODE_ENV === 'test') return;

    let retries = 3;
    while (retries > 0) {
      try {
        const cowries = await this.prisma.cowry.findMany();

        for (const cowry of cowries) {
          if (cowry.currentCowries < cowry.maxCowries) {
            await this.prisma.cowry.update({
              where: { id: cowry.id },
              data: {
                currentCowries: cowry.currentCowries + 1,
              },
            });
          }
        }
        
        // Success! Break out of the retry loop
        break;
      } catch (error: any) {
        retries--;
        console.error(`[Scheduler] Database connection error in rechargeCowries. Retries left: ${retries}. Message: ${error.message}`);
        
        if (retries === 0) {
          console.error('[Scheduler] Failed to recharge cowries after all retries.');
          break;
        }
        
        // Wait for 5 seconds before retrying to give the Neon DB instance time to wake up
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
}
