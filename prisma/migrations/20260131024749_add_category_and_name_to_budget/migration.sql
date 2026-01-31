-- CreateTable
CREATE TABLE "_BudgetToCategory" ("A" TEXT NOT NULL, "B" TEXT NOT NULL);
-- CreateIndex
CREATE UNIQUE INDEX "_BudgetToCategory_AB_unique" ON "_BudgetToCategory"("A", "B");
-- CreateIndex
CREATE INDEX "_BudgetToCategory_B_index" ON "_BudgetToCategory"("B");
-- AddForeignKey
ALTER TABLE "_BudgetToCategory"
ADD CONSTRAINT "_BudgetToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "_BudgetToCategory"
ADD CONSTRAINT "_BudgetToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- Migrate existing category_id to new join table
INSERT INTO "_BudgetToCategory" ("A", "B")
SELECT "id",
  "category_id"
FROM "budgets"
WHERE "category_id" IS NOT NULL;
-- AlterTable
-- Add columns with defaults or nullable first
ALTER TABLE "budgets"
ADD COLUMN "color" TEXT NOT NULL DEFAULT '#3B82F6';
ALTER TABLE "budgets"
ADD COLUMN "name" TEXT;
-- Update existing rows with default name
UPDATE "budgets"
SET "name" = 'My Budget';
-- Make name required
ALTER TABLE "budgets"
ALTER COLUMN "name"
SET NOT NULL;
-- DropForeignKey
ALTER TABLE "budgets" DROP CONSTRAINT "budgets_category_id_fkey";
-- DropIndex
DROP INDEX "budgets_category_id_idx";
-- DropIndex
DROP INDEX "budgets_user_id_category_id_period_key";
-- Drop old column
ALTER TABLE "budgets" DROP COLUMN "category_id";