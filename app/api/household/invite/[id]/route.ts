import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { respondHouseholdInvite, cancelHouseholdInvite } from "@/lib/household";

export const runtime = "nodejs";

const patchSchema = z.object({ action: z.enum(["accept", "decline"]) });

// PATCH: aceptar/rechazar una invitación de hogar (invitado).
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Acción no válida" }, { status: 400 });

  const result = await respondHouseholdInvite(user.id, id, parsed.data.action === "accept");
  if ("error" in result) return NextResponse.json(result, { status: 404 });
  return NextResponse.json(result);
}

// DELETE: cancelar una invitación saliente (miembro del hogar).
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  const result = await cancelHouseholdInvite(user.id, id);
  if ("error" in result) return NextResponse.json(result, { status: 404 });
  return NextResponse.json(result);
}
