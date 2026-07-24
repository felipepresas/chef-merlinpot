-- Nutrición y objetivos (Fase B): objetivo personal del usuario + kcal/proteína por receta.

-- CreateEnum
CREATE TYPE "Goal" AS ENUM ('PERDER_PESO', 'MANTENER', 'GANAR_MUSCULO');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "goal" "Goal";

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN "calories" INTEGER;
ALTER TABLE "Recipe" ADD COLUMN "proteinG" INTEGER;
