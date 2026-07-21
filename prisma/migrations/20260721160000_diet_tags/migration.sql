-- Etiquetas de dieta: qué dietas cumple una receta y qué restricciones tiene un usuario.

-- CreateEnum
CREATE TYPE "DietTag" AS ENUM ('VEGETARIANO', 'VEGANO', 'SIN_GLUTEN', 'SIN_LACTOSA');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "diets" "DietTag"[] NOT NULL DEFAULT ARRAY[]::"DietTag"[];

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN "diets" "DietTag"[] NOT NULL DEFAULT ARRAY[]::"DietTag"[];
