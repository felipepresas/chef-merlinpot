import "server-only";
import { prisma } from "@/lib/db";
import type { Goal } from "@prisma/client";

/** Objetivo nutricional personal del usuario. null = sin objetivo (opt-out). */
export async function getUserGoal(userId: string): Promise<Goal | null> {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { goal: true } });
  return u?.goal ?? null;
}

/** Fija (o quita, con null) el objetivo personal del usuario. */
export async function setUserGoal(userId: string, goal: Goal | null): Promise<Goal | null> {
  const u = await prisma.user.update({ where: { id: userId }, data: { goal }, select: { goal: true } });
  return u.goal;
}
