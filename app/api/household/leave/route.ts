import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { leaveHousehold } from "@/lib/household";

export const runtime = "nodejs";

// POST: salir del hogar compartido (empiezas un hogar personal nuevo).
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json(await leaveHousehold(user.id));
}
