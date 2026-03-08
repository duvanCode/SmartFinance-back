-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('CASH', 'DIGITAL_WALLET', 'BANK_ACCOUNT', 'CREDIT_CARD', 'SYSTEM');

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "account_id" TEXT,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "transfer_group_id" TEXT;

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "currency" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "bank_name" TEXT,
    "account_number" TEXT,
    "credit_limit" DECIMAL(10,2),
    "cutoff_date" INTEGER,
    "payment_date" INTEGER,
    "snapshot_balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "snapshot_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactions_since_snapshot" INTEGER NOT NULL DEFAULT 0,
    "snapshot_dirty" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE INDEX "accounts_user_id_type_idx" ON "accounts"("user_id", "type");

-- CreateIndex
CREATE INDEX "accounts_user_id_is_active_idx" ON "accounts"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "transactions_account_id_idx" ON "transactions"("account_id");

-- CreateIndex
CREATE INDEX "transactions_transfer_group_id_idx" ON "transactions"("transfer_group_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
