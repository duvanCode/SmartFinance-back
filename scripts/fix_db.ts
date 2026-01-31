import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting manual migration...');

    try {
        // 1. Create join table
        console.log('Creating _BudgetToCategory table...');
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "_BudgetToCategory" (
          "A" TEXT NOT NULL,
          "B" TEXT NOT NULL
      );
    `);

        // Create indices separately to avoid errors if they exist
        try {
            await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "_BudgetToCategory_AB_unique" ON "_BudgetToCategory"("A", "B");`);
        } catch (e) { console.log('Index AB might already exist'); }

        try {
            await prisma.$executeRawUnsafe(`CREATE INDEX "_BudgetToCategory_B_index" ON "_BudgetToCategory"("B");`);
        } catch (e) { console.log('Index B might already exist'); }

        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "_BudgetToCategory" ADD CONSTRAINT "_BudgetToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;`);
        } catch (e) { console.log('Constraint A might already exist'); }

        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "_BudgetToCategory" ADD CONSTRAINT "_BudgetToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;`);
        } catch (e) { console.log('Constraint B might already exist'); }

        // 2. Migrate data
        console.log('Migrating category relations...');
        // We check if category_id column exists before trying to select from it
        // But since this is a known fix script for a specific state, we assume it exists.
        // However, if we run this partial, it might fail.
        try {
            await prisma.$executeRawUnsafe(`
            INSERT INTO "_BudgetToCategory" ("A", "B")
            SELECT "id", "category_id" FROM "budgets" WHERE "category_id" IS NOT NULL
            ON CONFLICT DO NOTHING;
        `);
        } catch (e) {
            console.log('Error migrating categories, column might be gone or data mismatch:', e);
        }

        // 3. Add columns
        console.log('Adding name and color...');
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "budgets" ADD COLUMN IF NOT EXISTS "color" TEXT NOT NULL DEFAULT '#3B82F6';`);
        } catch (e) { console.log('Color column error:', e); }

        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "budgets" ADD COLUMN IF NOT EXISTS "name" TEXT;`);
        } catch (e) { console.log('Name column error:', e); }

        // 4. Update data
        console.log('Updating names...');
        await prisma.$executeRawUnsafe(`UPDATE "budgets" SET "name" = 'My Budget' WHERE "name" IS NULL;`);

        // 5. Constrain name
        console.log('Setting name to NOT NULL...');
        await prisma.$executeRawUnsafe(`ALTER TABLE "budgets" ALTER COLUMN "name" SET NOT NULL;`);

        // 6. Cleanup
        console.log('Dropping old columns...');
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "budgets" DROP CONSTRAINT IF EXISTS "budgets_category_id_fkey";`);
            await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "budgets_category_id_idx";`);
            await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "budgets_user_id_category_id_period_key";`);
            await prisma.$executeRawUnsafe(`ALTER TABLE "budgets" DROP COLUMN IF EXISTS "category_id";`);
        } catch (e) {
            console.log('Cleanup error (might be already done):', e);
        }

        console.log('Manual migration completed.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
