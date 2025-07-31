import os
import hashlib
import sys

# --- Configuration ---
MIGRATION_TIMESTAMP = "20250731140000" # MUST match the folder name
MIGRATION_NAME = "initial_setup"
MIGRATIONS_DIR = "prisma/migrations"

# --- Get SQL content from command line argument (or paste here directly) ---
# if len(sys.argv) < 2:
#     print("Usage: python create_migration_file.py \"<SQL_CONTENT>\"")
#     print("Alternatively, paste SQL content directly into the 'sql_content' variable in the script.")
#     sys.exit(1)
# sql_content = sys.argv[1] # The SQL content should be passed as a single string argument

sql_content = """
-- CreateTable
CREATE TABLE "XeroAuth" (
    "id" SERIAL NOT NULL,
    "tokenSet" JSONB NOT NULL DEFAULT '{}',
    "tenantId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,

    CONSTRAINT "XeroAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductPrice" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "customerId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Docket" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "driverRegNumber" TEXT,
    "customerId" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "deliveryAddress" TEXT,
    "inspectedBy" TEXT,
    "deliveredBy" TEXT,
    "receivedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "price" DOUBLE PRECISION NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "docketNumber" SERIAL NOT NULL,
    "invoiceGeneratedBy" TEXT,
    "invoiceGeneratedOn" TIMESTAMP(3),
    "weight" DOUBLE PRECISION,

    CONSTRAINT "Docket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductPrice_productId_customerId_key" ON "ProductPrice"("productId", "customerId");

-- AddForeignKey
ALTER TABLE "ProductPrice" ADD CONSTRAINT "ProductPrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Docket" ADD CONSTRAINT "Docket_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
"""

# --- Create directory ---
migration_folder_path = os.path.join(MIGRATIONS_DIR, f"{MIGRATION_TIMESTAMP}_{MIGRATION_NAME}")
os.makedirs(migration_folder_path, exist_ok=True)
print(f"Created migration folder: {migration_folder_path}")

# --- Write migration.sql file ---
migration_sql_path = os.path.join(migration_folder_path, "migration.sql")
# Write in binary mode to ensure no BOM and consistent line endings (LF)
with open(migration_sql_path, 'wb') as f:
    f.write(sql_content.encode('utf-8')) # Encode to bytes using UTF-8

print(f"Created migration.sql at: {migration_sql_path}")

# --- Calculate Checksum ---
hasher = hashlib.sha256()
with open(migration_sql_path, 'rb') as f: # Open in binary read mode for checksum
    while chunk := f.read(8192):
        hasher.update(chunk)
calculated_checksum = hasher.hexdigest().upper() # Return in uppercase to match Prisma's usual output

print(f"\nCalculated Checksum: {calculated_checksum}")
print(f"Migration ID (for DB insertion): {MIGRATION_TIMESTAMP}_{MIGRATION_NAME}")
print("\n--- Next: Insert this into _prisma_migrations table ---")
