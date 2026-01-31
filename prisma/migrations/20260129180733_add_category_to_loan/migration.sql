-- AlterTable
ALTER TABLE "loans" ADD COLUMN     "category_id" TEXT;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
