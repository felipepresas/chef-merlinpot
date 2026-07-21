import "server-only";
import { prisma } from "@/lib/db";
import { MEALS } from "@/lib/plan-labels";

export { DAYS_ES, MEALS, MEAL_LABEL } from "@/lib/plan-labels";

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

/**
 * Asigna (o quita, con recipeId=null) una receta a un hueco del plan, verificando
 * que el hueco pertenece al usuario. Devuelve el slot actualizado o null si no es suyo.
 */
export async function assignRecipeToSlot(
  userId: string,
  slotId: string,
  recipeId: string | null,
) {
  const slot = await prisma.planSlot.findUnique({
    where: { id: slotId },
    include: { weekPlan: { select: { userId: true } } },
  });
  if (!slot || slot.weekPlan.userId !== userId) return null;

  return prisma.planSlot.update({
    where: { id: slotId },
    data: { recipeId },
    include: { recipe: { select: { id: true, title: true } } },
  });
}
