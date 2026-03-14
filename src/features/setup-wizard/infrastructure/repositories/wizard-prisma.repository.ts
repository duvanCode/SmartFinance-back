import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { IWizardRepository } from '../../domain/repositories/wizard-repository.interface';

@Injectable()
export class WizardPrismaRepository implements IWizardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async isSetupCompleted(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { setupCompleted: true },
    });
    return user?.setupCompleted ?? false;
  }

  async markSetupCompleted(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        setupCompleted: true,
        setupCompletedAt: new Date(),
      },
    });
  }
}
