import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getCurrentWeekSlots } from "@/lib/plan";

export const runtime = "nodejs";

// GET: huecos de la semana actual (para asignar el campeón de El Duelo).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json(await getCurrentWeekSlots(user.id));
}
