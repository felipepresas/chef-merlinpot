import type { MealType } from "@prisma/client";

// Etiquetas de dominio (sin "server-only": se usan también en componentes cliente).
export const DAYS_ES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
export const MEALS: MealType[] = ["LUNCH", "DINNER"];
export const MEAL_LABEL: Record<MealType, string> = { LUNCH: "Almuerzo", DINNER: "Cena" };
