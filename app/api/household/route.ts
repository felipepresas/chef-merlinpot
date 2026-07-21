import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { getHouseholdData, inviteToHousehold } from "@/lib/household";

export const runtime = "nodejs";

// GET: mi hogar (miembros + invitaciones).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json(await getHouseholdData(user.id));
}

const bodySchema = z.object({ friendId: z.string().min(1) });

// POST: invitar a un amigo a mi hogar.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const result = await inviteToHousehold(user.id, parsed.data.friendId);
  if ("error" in result) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
