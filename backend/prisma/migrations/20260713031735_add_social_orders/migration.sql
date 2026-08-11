-- CreateEnum
CREATE TYPE "SocialOrderStatus" AS ENUM ('PROPOSED', 'SUBMITTED', 'ACCEPTED', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "SocialOrder" (
    "id" TEXT NOT NULL,
    "displayId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "orderType" TEXT NOT NULL,
    "customType" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "SocialOrderStatus" NOT NULL DEFAULT 'SUBMITTED',
    "createdById" TEXT NOT NULL,
    "proposalNote" TEXT,
    "subAccountId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialOrderAssignee" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialOrderAssignee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialOrderUpdate" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "status" "SocialOrderStatus" NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialOrderUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialOrderFile" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialOrderFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialOrderMessage" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialOrderMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocialOrder_agencyId_status_idx" ON "SocialOrder"("agencyId", "status");

-- CreateIndex
CREATE INDEX "SocialOrder_subAccountId_idx" ON "SocialOrder"("subAccountId");

-- CreateIndex
CREATE INDEX "SocialOrder_agencyId_displayId_idx" ON "SocialOrder"("agencyId", "displayId");

-- CreateIndex
CREATE INDEX "SocialOrderAssignee_userId_idx" ON "SocialOrderAssignee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialOrderAssignee_orderId_userId_key" ON "SocialOrderAssignee"("orderId", "userId");

-- CreateIndex
CREATE INDEX "SocialOrderUpdate_orderId_idx" ON "SocialOrderUpdate"("orderId");

-- CreateIndex
CREATE INDEX "SocialOrderFile_orderId_idx" ON "SocialOrderFile"("orderId");

-- CreateIndex
CREATE INDEX "SocialOrderMessage_orderId_createdAt_idx" ON "SocialOrderMessage"("orderId", "createdAt");

-- AddForeignKey
ALTER TABLE "SocialOrder" ADD CONSTRAINT "SocialOrder_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialOrder" ADD CONSTRAINT "SocialOrder_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialOrder" ADD CONSTRAINT "SocialOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialOrderAssignee" ADD CONSTRAINT "SocialOrderAssignee_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SocialOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialOrderAssignee" ADD CONSTRAINT "SocialOrderAssignee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialOrderUpdate" ADD CONSTRAINT "SocialOrderUpdate_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SocialOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialOrderUpdate" ADD CONSTRAINT "SocialOrderUpdate_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialOrderFile" ADD CONSTRAINT "SocialOrderFile_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SocialOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialOrderFile" ADD CONSTRAINT "SocialOrderFile_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialOrderMessage" ADD CONSTRAINT "SocialOrderMessage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SocialOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialOrderMessage" ADD CONSTRAINT "SocialOrderMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
