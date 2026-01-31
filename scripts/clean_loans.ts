import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking for duplicate loans per category...');

    // Find duplicates
    // Since we can't easily group by in prisma client without raw query roughly
    const duplicates = await prisma.$queryRaw`
    SELECT user_id, category_id, COUNT(*) as count
    FROM loans
    WHERE category_id IS NOT NULL
    GROUP BY user_id, category_id
    HAVING COUNT(*) > 1
  `;

    const duplicatRows = duplicates as any[];

    if (duplicatRows.length === 0) {
        console.log('No duplicates found.');
        return;
    }

    console.log(`Found ${duplicatRows.length} groups of duplicates. Resolving...`);

    for (const group of duplicatRows) {
        const { user_id, category_id } = group;

        // Get all loans for this group
        const loans = await prisma.loan.findMany({
            where: {
                userId: user_id,
                categoryId: category_id,
            },
            orderBy: { createdAt: 'desc' } // Keep the newest
        });

        // Skip the first one (keep it)
        const loansToModify = loans.slice(1);

        console.log(`For user ${user_id} and category ${category_id}, keeping loan ${loans[0].id}, unlinking ${loansToModify.length} others.`);

        // Update duplicate loans to remove category
        for (const loan of loansToModify) {
            await prisma.loan.update({
                where: { id: loan.id },
                data: { categoryId: null }
            });
            console.log(`- Unlinked loan ${loan.id} (${loan.name})`);
        }
    }

    console.log('Cleanup complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
