import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { fillWeek } from "@/lib/plan";

export const runtime = "nodejs";

// POST: rellena los huecos vacíos de la semana actual respetando comida y dieta.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const filled = await fillWeek(user.id);
  return NextResponse.json({ filled });
}
