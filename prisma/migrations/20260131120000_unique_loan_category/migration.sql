-- CreateIndex
CREATE UNIQUE INDEX "loans_user_id_category_id_key" ON "loans"("user_id", "category_id");