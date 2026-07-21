-- Hogar compartido: el plan y la compra pasan de User a Household.
-- Incluye backfill: un hogar personal por cada usuario existente y traspaso de sus planes.

-- CreateTable
CREATE TABLE "Household" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseholdInvite" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "inviteeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HouseholdInvite_pkey" PRIMARY KEY ("id")
);

-- User.householdId (nullable de momento para el backfill)
ALTER TABLE "User" ADD COLUMN "householdId" TEXT;

-- Backfill: un hogar por usuario existente y enlace
INSERT INTO "Household" ("id", "createdAt")
SELECT 'hh-' || "id", CURRENT_TIMESTAMP FROM "User";
UPDATE "User" SET "householdId" = 'hh-' || "id";

-- WeekPlan: userId -> householdId (con traspaso)
ALTER TABLE "WeekPlan" ADD COLUMN "householdId" TEXT;
UPDATE "WeekPlan" wp SET "householdId" = u."householdId" FROM "User" u WHERE wp."userId" = u."id";

ALTER TABLE "WeekPlan" DROP CONSTRAINT "WeekPlan_userId_fkey";
DROP INDEX "WeekPlan_userId_weekStartDate_key";
ALTER TABLE "WeekPlan" DROP COLUMN "userId";
ALTER TABLE "WeekPlan" ALTER COLUMN "householdId" SET NOT NULL;

-- Índices
CREATE INDEX "User_householdId_idx" ON "User"("householdId");
CREATE UNIQUE INDEX "WeekPlan_householdId_weekStartDate_key" ON "WeekPlan"("householdId", "weekStartDate");
CREATE INDEX "HouseholdInvite_inviteeId_idx" ON "HouseholdInvite"("inviteeId");
CREATE UNIQUE INDEX "HouseholdInvite_householdId_inviteeId_key" ON "HouseholdInvite"("householdId", "inviteeId");

-- Claves foráneas
ALTER TABLE "User" ADD CONSTRAINT "User_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WeekPlan" ADD CONSTRAINT "WeekPlan_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HouseholdInvite" ADD CONSTRAINT "HouseholdInvite_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HouseholdInvite" ADD CONSTRAINT "HouseholdInvite_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HouseholdInvite" ADD CONSTRAINT "HouseholdInvite_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
