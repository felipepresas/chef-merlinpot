import "server-only";
import { prisma } from "@/lib/db";
import type { MealType } from "@prisma/client";

export const DAYS_ES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
export const MEALS: MealType[] = ["LUNCH", "DINNER"];
export const MEAL_LABEL: Record<MealType, string> = { LUNCH: "Almuerzo", DINNER: "Cena" };

/** Lunes (UTC) de la semana que contiene `date`. */
export function mondayOf(date = new Date()): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const offset = (d.getUTCDay() + 6) % 7; // 0 = lunes
  d.setUTCDate(d.getUTCDate() - offset);
  return d;
}

/**
 * Obtiene (o crea) el plan de la semana actual del usuario, con sus 14 huecos
 * (7 días × almuerzo/cena) y la receta asignada a cada uno.
 */
export async function getOrCreateCurrentWeekPlan(userId: string) {
  const weekStartDate = mondayOf();
  const include = { slots: { include: { recipe: true } } } as const;

  const existing = await prisma.weekPlan.findUnique({
    where: { userId_weekStartDate: { userId, weekStartDate } },
    include,
  });
  if (existing) return existing;

  return prisma.weekPlan.create({
    data: {
      userId,
      weekStartDate,
      slots: {
        create: Array.from({ length: 7 }).flatMap((_, day) =>
          MEALS.map((mealType) => ({ dayOfWeek: day, mealType })),
        ),
      },
    },
    include,
  });
}
