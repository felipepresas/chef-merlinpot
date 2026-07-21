import "server-only";
import { prisma } from "@/lib/db";

/** Devuelve el id del hogar del usuario, creándole uno personal si aún no tiene. */
export async function getHouseholdId(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { householdId: true } });
  if (user?.householdId) return user.householdId;
  const household = await prisma.household.create({ data: { members: { connect: { id: userId } } } });
  return household.id;
}

/** Nº de miembros del hogar (para escalar la compra). */
export async function getHouseholdSize(householdId: string): Promise<number> {
  const n = await prisma.user.count({ where: { householdId } });
  return Math.max(1, n);
}
