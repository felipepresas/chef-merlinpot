import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getRecipes } from "@/lib/recipes";
import type { MealType } from "@prisma/client";

export const runtime = "nodejs";

// GET: catálogo de recetas (opcionalmente filtrado por ?meal=LUNCH|DINNER).
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const meal = new URL(req.url).searchParams.get("meal");
  const mealType = meal === "LUNCH" || meal === "DINNER" ? (meal as MealType) : undefined;
  return NextResponse.json(await getRecipes(mealType));
}
