import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { getFriendData, sendFriendRequest } from "@/lib/friends";

export const runtime = "nodejs";

// GET: amigos + solicitudes.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json(await getFriendData(user.id));
}

const bodySchema = z.object({ email: z.string().email() });

// POST: enviar solicitud de amistad por email.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Email no válido" }, { status: 400 });

  const result = await sendFriendRequest(user.id, parsed.data.email);
  if ("error" in result) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
