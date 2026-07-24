import type { Goal, MealType } from "@prisma/client";

// Nutrición por ración de una receta. Sin "server-only": funciones puras usadas
// tanto en el planificador (servidor) como en la UI (cliente).
export type Nutrition = { calories: number | null; proteinG: number | null };

// kcal "ideal" por plato según objetivo y comida. La cena es más ligera que la comida
// (evidencia: comida ~35-40% del día, cena ~20-30%). Números aproximados: lo que importa
// es el sesgo relativo del planificador, no un objetivo calórico exacto.
const TARGET_KCAL: Record<Exclude<Goal, "MANTENER">, Record<MealType, number>> = {
  PERDER_PESO: { LUNCH: 450, DINNER: 350 },
  GANAR_MUSCULO: { LUNCH: 650, DINNER: 600 },
};

// Cuánto pesa la proteína en la puntuación (g/10 → puntos), por objetivo.
const PROTEIN_WEIGHT: Record<Exclude<Goal, "MANTENER">, number> = {
  PERDER_PESO: 0.5, // proteína cuenta, pero manda la ligereza (kcal)
  GANAR_MUSCULO: 1.6, // la proteína es la prioridad
};

/** ¿Este objetivo sesga el planificador? MANTENER (y null) no: solo muestran kcal. */
export function goalBiases(goal: Goal | null): goal is "PERDER_PESO" | "GANAR_MUSCULO" {
  return goal === "PERDER_PESO" || goal === "GANAR_MUSCULO";
}

/**
 * Puntúa cómo de bien encaja una receta con el objetivo en esa comida (mayor = mejor):
 * cercanía a las kcal ideales + bonus de proteína. Recetas sin kcal → 0 (neutro, ni se
 * premian ni se penalizan, así el pool nunca queda vacío por falta de datos).
 */
export function scoreRecipe(r: Nutrition, meal: MealType, goal: Goal | null): number {
  if (!goalBiases(goal) || r.calories == null) return 0;
  const closeness = -Math.abs(r.calories - TARGET_KCAL[goal][meal]) / 100; // −distancia (cientos de kcal)
  const protein = ((r.proteinG ?? 0) / 10) * PROTEIN_WEIGHT[goal];
  return closeness + protein;
}

/** "≈ 520 kcal" */
export function formatKcal(n: number): string {
  return `≈ ${Math.round(n)} kcal`;
}

/** "32 g proteína" */
export function formatProtein(n: number): string {
  return `${Math.round(n)} g proteína`;
}
