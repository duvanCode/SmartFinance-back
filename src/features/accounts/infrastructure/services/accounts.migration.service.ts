import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { AccountType } from '@prisma/client';

@Injectable()
export class AccountsMigrationService implements OnModuleInit {
    private readonly logger = new Logger(AccountsMigrationService.name);

    constructor(private readonly prisma: PrismaService) { }

    async onModuleInit() {
        this.logger.log('Checking for transactions requiring account migration...');
        await this.migrateUnassignedTransactions();
    }

    private async migrateUnassignedTransactions() {
        // 1. Find users who have transactions without an accountId
        const usersWithUnassignedTxs = await this.prisma.transaction.findMany({
            where: { accountId: null },
            select: { userId: true },
            distinct: ['userId'],
        });

        if (usersWithUnassignedTxs.length === 0) {
            this.logger.log('No transactions require migration. All set!');
            return;
        }

        this.logger.log(`Found ${usersWithUnassignedTxs.length} users requiring transaction migration.`);

        // 2. For each user, ensure the "Sin asignar" account exists and link transactions
        for (const { userId } of usersWithUnassignedTxs) {
            await this.prisma.$transaction(async (tx) => {
                // Find or create the "Sin asignar" SYSTEM account
                let fallbackAccount = await tx.account.findFirst({
                    where: { userId, type: AccountType.SYSTEM, name: 'Sin asignar' },
                });

                if (!fallbackAccount) {
                    fallbackAccount = await tx.account.create({
                        data: {
                            userId,
                            name: 'Sin asignar',
                            type: AccountType.SYSTEM,
                            isActive: true,
                        },
                    });
                }

                // Link all unassigned transactions for this user to the fallback account
                const updateResult = await tx.transaction.updateMany({
                    where: { userId, accountId: null },
                    data: { accountId: fallbackAccount.id },
                });

                this.logger.log(`Migrated ${updateResult.count} transactions for user ${userId}.`);

                // Recalculate snapshot based on the new transactions
                // Note: For SYSTEM type "Sin asignar", balance doesn't really matter as per requirements,
                // but it's good for consistency. We'll just mark it dirty.
                await tx.account.update({
                    where: { id: fallbackAccount.id },
                    data: { snapshotDirty: true },
                });
            });
        }

        this.logger.log('Migration of unassigned transactions completed successfully.');
    }
}
