import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { assignRecipeToSlot } from "@/lib/plan";

export const runtime = "nodejs";

const schema = z.object({
  slotId: z.string().min(1),
  recipeId: z.string().min(1).nullable(),
});

// PATCH: asigna (o quita) una receta a un hueco del plan del usuario.
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const slot = await assignRecipeToSlot(user.id, parsed.data.slotId, parsed.data.recipeId);
  if (!slot) return NextResponse.json({ error: "Hueco no encontrado" }, { status: 404 });

  return NextResponse.json({ recipe: slot.recipe ?? null });
}
