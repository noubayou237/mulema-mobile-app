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
  }
}
