import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { getDuelState, acceptDuel, vetoDuel, cancelDuel } from "@/lib/duel";

export const runtime = "nodejs";

// GET: estado completo de la partida.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  const state = await getDuelState(user.id, id);
  if (!state) return NextResponse.json({ error: "Partida no encontrada" }, { status: 404 });
  return NextResponse.json(state);
}

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("accept") }),
  z.object({ action: z.literal("cancel") }),
  z.object({ action: z.literal("veto"), recipeId: z.string().min(1) }),
]);

// POST: acción sobre la partida (accept | veto | cancel).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  const parsed = actionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Acción no válida" }, { status: 400 });

  let result: { ok: true } | { error: string };
  if (parsed.data.action === "accept") result = await acceptDuel(user.id, id);
  else if (parsed.data.action === "cancel") result = await cancelDuel(user.id, id);
  else result = await vetoDuel(user.id, id, parsed.data.recipeId);

  if ("error" in result) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
