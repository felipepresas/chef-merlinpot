import "server-only";
import { prisma } from "@/lib/db";
import { MEALS } from "@/lib/plan-labels";
import { getHouseholdId } from "@/lib/household";
import { getHouseholdDiets } from "@/lib/diet";
import { getUserGoal } from "@/lib/goal";
import { goalBiases, scoreRecipe } from "@/lib/nutrition";
import { getRecipes } from "@/lib/recipes";
import type { MealType } from "@prisma/client";

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
  const householdId = await getHouseholdId(userId);
  const weekStartDate = mondayOf();
  const include = { slots: { include: { recipe: true } } } as const;

  const existing = await prisma.weekPlan.findUnique({
    where: { householdId_weekStartDate: { householdId, weekStartDate } },
    include,
  });
  if (existing) return existing;

  return prisma.weekPlan.create({
    data: {
      householdId,
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

/** Huecos de la semana actual del usuario (para el selector de El Duelo). */
export async function getCurrentWeekSlots(userId: string) {
  const plan = await getOrCreateCurrentWeekPlan(userId);
  return plan.slots
    .slice()
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
    .map((s) => ({
      slotId: s.id,
      dayOfWeek: s.dayOfWeek,
      mealType: s.mealType,
      recipeTitle: s.recipe?.title ?? null,
    }));
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
  const householdId = await getHouseholdId(userId);
  const slot = await prisma.planSlot.findUnique({
    where: { id: slotId },
    include: { weekPlan: { select: { householdId: true } } },
  });
  if (!slot || slot.weekPlan.householdId !== householdId) return null;

  return prisma.planSlot.update({
    where: { id: slotId },
    data: { recipeId },
    include: {
      recipe: { select: { id: true, title: true, slug: true, calories: true, proteinG: true } },
    },
  });
}

/** Baraja una copia (Fisher–Yates). */
function shuffled<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type FilledSlot = {
  slotId: string;
  recipe: { id: string; title: string; slug: string; calories: number | null; proteinG: number | null };
};

/**
 * "Rellena mi semana": asigna una receta a cada hueco vacío del plan actual,
 * respetando el tipo de comida y la dieta del hogar, y evitando repetir recetas
 * ya presentes esa semana. Si el usuario tiene un objetivo que sesga (perder/ganar),
 * ordena el pool por encaje con el objetivo (kcal + proteína), con la cena más ligera;
 * entre empates el orden sigue siendo aleatorio (variedad). Si se agota el catálogo de
 * un tipo, rebaraja (permite repetir). No pisa los huecos ya asignados.
 */
export async function fillWeek(userId: string): Promise<FilledSlot[]> {
  const householdId = await getHouseholdId(userId);
  const [plan, diets, goal] = await Promise.all([
    getOrCreateCurrentWeekPlan(userId),
    getHouseholdDiets(householdId),
    getUserGoal(userId), // objetivo de quien pulsa (personal)
  ]);

  const pools = new Map<MealType, Awaited<ReturnType<typeof getRecipes>>>();
  await Promise.all(
    MEALS.map(async (meal) => pools.set(meal, await getRecipes(meal, diets))),
  );

  const filled: FilledSlot[] = [];
  for (const meal of MEALS) {
    const pool = pools.get(meal) ?? [];
    if (pool.length === 0) continue;

    // Baraja siempre (variedad) y, si el objetivo sesga, reordena por encaje de forma
    // estable: los mejores primero, pero los empates conservan el orden aleatorio.
    const orderPool = () => {
      const s = shuffled(pool);
      if (goalBiases(goal)) s.sort((a, b) => scoreRecipe(b, meal, goal) - scoreRecipe(a, meal, goal));
      return s;
    };

    const empty = plan.slots.filter((s) => s.mealType === meal && !s.recipeId);
    const used = new Set(
      plan.slots.filter((s) => s.mealType === meal && s.recipeId).map((s) => s.recipeId!),
    );

    let queue = orderPool().filter((r) => !used.has(r.id));
    for (const slot of empty) {
      if (queue.length === 0) queue = orderPool(); // agotado: permite repetir
      const pick = queue.shift()!;
      used.add(pick.id);
      filled.push({
        slotId: slot.id,
        recipe: { id: pick.id, title: pick.title, slug: pick.slug, calories: pick.calories, proteinG: pick.proteinG },
      });
    }
  }

  if (filled.length) {
    await prisma.$transaction(
      filled.map((f) =>
        prisma.planSlot.update({ where: { id: f.slotId }, data: { recipeId: f.recipe.id } }),
      ),
    );
  }
  return filled;
}
