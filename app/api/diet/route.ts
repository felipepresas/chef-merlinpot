import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserDiets, setUserDiets } from "@/lib/diet";

export const runtime = "nodejs";

// GET: mis restricciones dietéticas.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json(await getUserDiets(user.id));
}

const bodySchema = z.object({
  diets: z.array(z.enum(["VEGETARIANO", "VEGANO", "SIN_GLUTEN", "SIN_LACTOSA"])),
});

// PUT: fijar mis restricciones.
export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  return NextResponse.json(await setUserDiets(user.id, parsed.data.diets));
}
