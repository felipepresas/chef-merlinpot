import "server-only";
import { prisma } from "@/lib/db";
import { DIET_TAGS } from "@/lib/diet-labels";
import type { DietTag } from "@prisma/client";

export async function getUserDiets(userId: string): Promise<DietTag[]> {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { diets: true } });
  return u?.diets ?? [];
}

export async function setUserDiets(userId: string, diets: DietTag[]): Promise<DietTag[]> {
  const clean = DIET_TAGS.filter((t) => diets.includes(t)); // saneado + orden estable
  const u = await prisma.user.update({ where: { id: userId }, data: { diets: clean }, select: { diets: true } });
  return u.diets;
}

/** Unión de las restricciones de todos los miembros del hogar. */
export async function getHouseholdDiets(householdId: string): Promise<DietTag[]> {
  const members = await prisma.user.findMany({ where: { householdId }, select: { diets: true } });
  const set = new Set<DietTag>();
  for (const m of members) for (const d of m.diets) set.add(d);
  return DIET_TAGS.filter((t) => set.has(t));
}
