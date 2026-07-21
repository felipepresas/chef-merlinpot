import type { DietTag } from "@prisma/client";

// Etiquetas de dieta (sin "server-only": se usan también en cliente).
export const DIET_TAGS: DietTag[] = ["VEGETARIANO", "VEGANO", "SIN_GLUTEN", "SIN_LACTOSA"];

export const DIET_LABEL: Record<DietTag, string> = {
  VEGETARIANO: "Vegetariano",
  VEGANO: "Vegano",
  SIN_GLUTEN: "Sin gluten",
  SIN_LACTOSA: "Sin lactosa",
};
