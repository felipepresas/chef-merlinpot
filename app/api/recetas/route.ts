import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getRecipes } from "@/lib/recipes";
import { getHouseholdId } from "@/lib/household";
import { getHouseholdDiets } from "@/lib/diet";
import type { MealType } from "@prisma/client";

export const runtime = "nodejs";

// GET: catálogo filtrado por ?meal=LUNCH|DINNER y por la dieta del hogar
// (unión de restricciones de los miembros). ?all=1 ignora la dieta.
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const url = new URL(req.url);
  const meal = url.searchParams.get("meal");
  const mealType = meal === "LUNCH" || meal === "DINNER" ? (meal as MealType) : undefined;

  const diets =
    url.searchParams.get("all") === "1" ? [] : await getHouseholdDiets(await getHouseholdId(user.id));

  return NextResponse.json(await getRecipes(mealType, diets));
}
