import "server-only";
import { prisma } from "@/lib/db";

/** Catálogo de recetas para el selector del plan. */
export async function getRecipes() {
  return prisma.recipe.findMany({
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
