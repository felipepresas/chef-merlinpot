import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { createDuel, listDuels } from "@/lib/duel";

export const runtime = "nodejs";

// GET: mis partidas activas / invitaciones pendientes.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json(await listDuels(user.id));
}

const bodySchema = z.object({
  friendId: z.string().min(1),
  mealType: z.enum(["LUNCH", "DINNER"]).nullable().optional(),
});

// POST: crear una sala retando a un amigo.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const result = await createDuel(user.id, parsed.data.friendId, parsed.data.mealType ?? null);
  if ("error" in result) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
