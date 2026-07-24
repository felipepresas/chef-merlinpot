import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserGoal, setUserGoal } from "@/lib/goal";

export const runtime = "nodejs";

// GET: mi objetivo nutricional (o null).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json({ goal: await getUserGoal(user.id) });
}

const bodySchema = z.object({
  goal: z.enum(["PERDER_PESO", "MANTENER", "GANAR_MUSCULO"]).nullable(),
});

// PUT: fijar (o quitar con null) mi objetivo.
export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  return NextResponse.json({ goal: await setUserGoal(user.id, parsed.data.goal) });
}
