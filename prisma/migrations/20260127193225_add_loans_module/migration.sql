-- CreateEnum
CREATE TYPE "LoanType" AS ENUM ('RECEIVED', 'GIVEN');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('ACTIVE', 'PAID', 'CANCELLED');

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "is_loan" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "loan_id" TEXT;

-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "initial_amount" DECIMAL(10,2) NOT NULL,
    "paid_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "pending_amount" DECIMAL(10,2) NOT NULL,
    "interest_rate" DECIMAL(5,2),
    "type" "LoanType" NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'ACTIVE',
    "start_date" TIMESTAMP(3) NOT NULL,
    "category_name" TEXT,
    "notes" TEXT,
    "creditor_debtor" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "loans_user_id_idx" ON "loans"("user_id");

-- CreateIndex
CREATE INDEX "loans_user_id_status_idx" ON "loans"("user_id", "status");

-- CreateIndex
CREATE INDEX "loans_user_id_type_idx" ON "loans"("user_id", "type");

-- CreateIndex
CREATE INDEX "loans_user_id_type_status_idx" ON "loans"("user_id", "type", "status");

-- CreateIndex
CREATE INDEX "budgets_user_id_is_active_idx" ON "budgets"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "categories_user_id_type_idx" ON "categories"("user_id", "type");

-- CreateIndex
CREATE INDEX "transactions_user_id_type_idx" ON "transactions"("user_id", "type");

-- CreateIndex
CREATE INDEX "transactions_user_id_date_type_idx" ON "transactions"("user_id", "date", "type");

-- CreateIndex
CREATE INDEX "transactions_loan_id_idx" ON "transactions"("loan_id");

-- CreateIndex
CREATE INDEX "transactions_user_id_is_loan_idx" ON "transactions"("user_id", "is_loan");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
