-- DropIndex
DROP INDEX "Product_userId_name_idx";

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "Product"("name");
