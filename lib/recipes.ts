import "server-only";
import { prisma } from "@/lib/db";
import type { MealType, DietTag } from "@prisma/client";

/** Catálogo de recetas, filtrable por tipo de comida y por dietas que debe cumplir. */
export async function getRecipes(mealType?: MealType, diets?: DietTag[]) {
  return prisma.recipe.findMany({
    where: {
      ...(mealType ? { mealType } : {}),
      ...(diets && diets.length ? { diets: { hasEvery: diets } } : {}),
    },
    orderBy: { title: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      mealType: true,
      cookTimeMin: true,
      cuisine: true,
    },
  });
}

/** Ficha completa de una receta (ingredientes ordenados por pasillo). */
export async function getRecipeBySlug(slug: string) {
  return prisma.recipe.findUnique({
    where: { slug },
    include: {
      ingredients: {
        include: { ingredient: true },
        orderBy: { ingredient: { category: "asc" } },
      },
    },
  });
}

/** Paso estructurado de una receta (Recipe.steps es Json). */
export type RecipeStep = { text: string; durationMin?: number };
