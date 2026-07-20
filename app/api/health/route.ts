import { NextResponse } from "next/server";

// Endpoint de salud para el HEALTHCHECK del contenedor (Dokploy / Docker).
// Ligero a propósito: no toca la base de datos.
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ status: "ok", service: "chef" });
}
