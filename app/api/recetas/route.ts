import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getRecipes } from "@/lib/recipes";

export const runtime = "nodejs";

// GET: catálogo de recetas (para el selector del plan).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json(await getRecipes());
}
