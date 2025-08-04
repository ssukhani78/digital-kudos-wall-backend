-- CreateTable
CREATE TABLE "categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL UNIQUE
);

-- CreateTable
CREATE TABLE "kudos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" INTEGER NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "kudos_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "kudos_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "kudos_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "kudos_senderId_idx" ON "kudos"("senderId");

-- CreateIndex
CREATE INDEX "kudos_recipientId_idx" ON "kudos"("recipientId");

-- CreateIndex
CREATE INDEX "kudos_categoryId_idx" ON "kudos"("categoryId");

-- Insert default categories
INSERT INTO "categories" ("name") VALUES 
    ('Teamwork'),
    ('Leadership'),
    ('Innovation'),
    ('Communication'),
    ('Problem Solving'),
    ('Mentorship'),
    ('Collaboration'),
    ('Excellence'); 