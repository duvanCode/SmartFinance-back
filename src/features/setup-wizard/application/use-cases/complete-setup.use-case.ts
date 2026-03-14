import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { IWizardRepository, WIZARD_REPOSITORY } from '../../domain/repositories/wizard-repository.interface';
import { CompleteSetupDto } from '../dto/complete-setup.dto';

const INITIAL_BALANCE_CATEGORY_NAME = 'Saldo inicial';

@Injectable()
export class CompleteSetupUseCase {
  constructor(
    @Inject(WIZARD_REPOSITORY)
    private readonly wizardRepository: IWizardRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(userId: string, dto: CompleteSetupDto): Promise<void> {
    const alreadyDone = await this.wizardRepository.isSetupCompleted(userId);
    if (alreadyDone) {
      throw new BadRequestException('Setup has already been completed for this user');
    }

    await this.prisma.$transaction(async (tx) => {
      // ── 1. Find or create the default "Saldo inicial" INCOME category ──
      let initialCategory = await tx.category.findFirst({
        where: {
          userId,
          name: INITIAL_BALANCE_CATEGORY_NAME,
          type: 'INCOME',
        },
      });

      if (!initialCategory) {
        initialCategory = await tx.category.create({
          data: {
            userId,
            name: INITIAL_BALANCE_CATEGORY_NAME,
            type: 'INCOME',
            color: '#22c55e',
            icon: 'Wallet',
            isDefault: false,
          },
        });
      }

      const now = new Date();

      // ── 2. Create each account then its initial-balance transaction ──
      for (const acc of dto.accounts) {
        const account = await tx.account.create({
          data: {
            userId,
            name: acc.name,
            type: acc.type as any,
            currency: 'COP',
            bankName: acc.bankName ?? null,
            creditLimit:
              acc.type === 'CREDIT_CARD' && acc.creditLimit != null
                ? acc.creditLimit
                : null,
            // Start at 0; balance is driven entirely by transactions
            snapshotBalance: 0,
            snapshotDate: now,
          },
        });

        // Only create a transaction if the user provided a non-zero balance
        if (acc.balance && acc.balance !== 0) {
          await tx.transaction.create({
            data: {
              userId,
              accountId: account.id,
              categoryId: initialCategory.id,
              // Credit-card debt is outgoing → EXPENSE; everything else → INCOME
              type: acc.type === 'CREDIT_CARD' ? 'EXPENSE' : 'INCOME',
              amount: Math.abs(acc.balance),
              description: `${INITIAL_BALANCE_CATEGORY_NAME} · ${acc.name}`,
              date: now,
              source: 'MANUAL',
            },
          });
        }
      }

      // ── 3. Mark setup as complete ──
      await tx.user.update({
        where: { id: userId },
        data: {
          setupCompleted: true,
          setupCompletedAt: now,
        },
      });
    });
  }
}
