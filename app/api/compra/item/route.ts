import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { toggleShoppingItem } from "@/lib/shopping";

export const runtime = "nodejs";

const schema = z.object({ itemId: z.string().min(1), checked: z.boolean() });

// PATCH: marca/desmarca un ítem de la compra como comprado.
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const item = await toggleShoppingItem(user.id, parsed.data.itemId, parsed.data.checked);
  if (!item) return NextResponse.json({ error: "Ítem no encontrado" }, { status: 404 });

  return NextResponse.json({ ok: true, checked: item.checked });
}
