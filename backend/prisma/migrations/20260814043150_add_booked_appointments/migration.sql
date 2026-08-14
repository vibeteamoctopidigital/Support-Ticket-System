-- CreateTable
CREATE TABLE "BookedAppointment" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "ghlEventId" TEXT NOT NULL,
    "ghlCalendarId" TEXT,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "title" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookedAppointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookedAppointment_agencyId_startTime_idx" ON "BookedAppointment"("agencyId", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "BookedAppointment_agencyId_ghlEventId_key" ON "BookedAppointment"("agencyId", "ghlEventId");

-- AddForeignKey
ALTER TABLE "BookedAppointment" ADD CONSTRAINT "BookedAppointment_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
