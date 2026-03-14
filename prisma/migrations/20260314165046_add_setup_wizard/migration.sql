-- AlterTable
ALTER TABLE "users" ADD COLUMN     "setup_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "setup_completed_at" TIMESTAMP(3);
