import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, destroySession } from "@/lib/auth/session";

export const runtime = "nodejs";

const bodySchema = z.object({ idToken: z.string().min(10) });

// POST: intercambia un ID token de Firebase por una cookie de sesión.
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "idToken requerido" }, { status: 400 });
  }
  try {
    await createSession(parsed.data.idToken);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo crear la sesión" }, { status: 401 });
  }
}

// DELETE: cierra sesión.
export async function DELETE() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
