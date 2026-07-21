import "server-only";
import { prisma } from "@/lib/db";
import { areFriends } from "@/lib/friends";
import type { MealType, DuelStatus } from "@prisma/client";

const POOL_SIZE = 6; // nº de platos candidatos al empezar

const recipeSelect = {
  id: true, slug: true, title: true, mealType: true, cookTimeMin: true, cuisine: true,
} as const;

type RecipeCard = {
  id: string; slug: string; title: string; mealType: MealType; cookTimeMin: number | null; cuisine: string | null;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Recetas por ids, preservando el orden dado. */
async function cardsByIds(ids: string[]): Promise<RecipeCard[]> {
  if (ids.length === 0) return [];
  const rows = await prisma.recipe.findMany({ where: { id: { in: ids } }, select: recipeSelect });
  const byId = new Map(rows.map((r) => [r.id, r]));
  return ids.map((id) => byId.get(id)).filter((r): r is RecipeCard => !!r);
}

// ─── Crear / aceptar / cancelar ─────────────────────────────────────────────

export async function createDuel(
  hostId: string,
  friendId: string,
  mealType: MealType | null,
): Promise<{ sessionId: string } | { error: string }> {
  if (friendId === hostId) return { error: "No puedes retarte a ti mismo." };
  if (!(await areFriends(hostId, friendId))) return { error: "Solo puedes retar a tus amigos." };

  const session = await prisma.duelSession.create({
    data: {
      hostId,
      mealType,
      participants: {
        create: [
          { userId: hostId, order: 0, accepted: true },
          { userId: friendId, order: 1, accepted: false },
        ],
      },
    },
  });
  return { sessionId: session.id };
}

/** Acepta la invitación; si ya han aceptado todos, arranca la partida. */
export async function acceptDuel(userId: string, sessionId: string): Promise<{ ok: true } | { error: string }> {
  const me = await prisma.duelParticipant.findFirst({ where: { sessionId, userId } });
  if (!me) return { error: "No estás en esta partida." };

  await prisma.duelParticipant.updateMany({ where: { sessionId, userId }, data: { accepted: true } });

  const parts = await prisma.duelParticipant.findMany({ where: { sessionId }, orderBy: { order: "asc" } });
  const session = await prisma.duelSession.findUnique({ where: { id: sessionId } });
  if (!session || session.status !== "WAITING") return { ok: true };

  if (parts.every((p) => p.accepted)) {
    const recipes = await prisma.recipe.findMany({
      where: session.mealType ? { mealType: session.mealType } : undefined,
      select: { id: true },
    });
    if (recipes.length < 2) return { error: "No hay suficientes recetas para el duelo." };
    const pool = shuffle(recipes.map((r) => r.id)).slice(0, POOL_SIZE);

    await prisma.duelSession.updateMany({
      where: { id: sessionId, status: "WAITING" },
      data: { status: "ACTIVE", candidateIds: pool, turnUserId: parts[0].userId, version: { increment: 1 } },
    });
  }
  return { ok: true };
}

export async function cancelDuel(userId: string, sessionId: string): Promise<{ ok: true } | { error: string }> {
  const me = await prisma.duelParticipant.findFirst({ where: { sessionId, userId } });
  if (!me) return { error: "No estás en esta partida." };
  await prisma.duelSession.updateMany({
    where: { id: sessionId, status: { in: ["WAITING", "ACTIVE"] } },
    data: { status: "CANCELLED", turnUserId: null, version: { increment: 1 } },
  });
  return { ok: true };
}

/** Veta un plato en tu turno. Concurrencia optimista con `version`. */
export async function vetoDuel(
  userId: string,
  sessionId: string,
  recipeId: string,
): Promise<{ ok: true } | { error: string }> {
  const session = await prisma.duelSession.findUnique({ where: { id: sessionId } });
  if (!session || session.status !== "ACTIVE") return { error: "La partida no está activa." };
  if (session.turnUserId !== userId) return { error: "No es tu turno." };
  if (!session.candidateIds.includes(recipeId)) return { error: "Ese plato ya no está en liza." };

  const candidateIds = session.candidateIds.filter((id) => id !== recipeId);
  const eliminatedIds = [...session.eliminatedIds, recipeId];

  let status: DuelStatus = "ACTIVE";
  let turnUserId: string | null;
  let winnerId: string | null = null;

  if (candidateIds.length === 1) {
    status = "FINISHED";
    winnerId = candidateIds[0];
    turnUserId = null;
  } else {
    // siguiente participante en orden de turno (round-robin, extensible a N)
    const parts = await prisma.duelParticipant.findMany({ where: { sessionId }, orderBy: { order: "asc" } });
    const idx = parts.findIndex((p) => p.userId === userId);
    turnUserId = parts[(idx + 1) % parts.length].userId;
  }

  const res = await prisma.duelSession.updateMany({
    where: { id: sessionId, version: session.version, turnUserId: userId, status: "ACTIVE" },
    data: { candidateIds, eliminatedIds, status, turnUserId, winnerId, version: { increment: 1 } },
  });
  if (res.count === 0) return { error: "El estado cambió, inténtalo de nuevo." };
  return { ok: true };
}

// ─── Lectura ────────────────────────────────────────────────────────────────

export type DuelStateView = {
  id: string;
  status: DuelStatus;
  mealType: MealType | null;
  version: number;
  isHost: boolean;
  myTurn: boolean;
  turnUserId: string | null;
  participants: { userId: string; name: string; accepted: boolean; isMe: boolean; isTurn: boolean }[];
  candidates: RecipeCard[];
  eliminated: RecipeCard[];
  winner: RecipeCard | null;
};

export async function getDuelState(userId: string, sessionId: string): Promise<DuelStateView | null> {
  const session = await prisma.duelSession.findUnique({
    where: { id: sessionId },
    include: { participants: { include: { user: { select: { id: true, name: true, email: true } } }, orderBy: { order: "asc" } } },
  });
  if (!session) return null;
  if (!session.participants.some((p) => p.userId === userId)) return null;

  const [candidates, eliminated, winnerArr] = await Promise.all([
    cardsByIds(session.candidateIds),
    cardsByIds(session.eliminatedIds),
    session.winnerId ? cardsByIds([session.winnerId]) : Promise.resolve([]),
  ]);

  return {
    id: session.id,
    status: session.status,
    mealType: session.mealType,
    version: session.version,
    isHost: session.hostId === userId,
    myTurn: session.turnUserId === userId,
    turnUserId: session.turnUserId,
    participants: session.participants.map((p) => ({
      userId: p.userId,
      name: p.user.name ?? p.user.email,
      accepted: p.accepted,
      isMe: p.userId === userId,
      isTurn: session.turnUserId === p.userId,
    })),
    candidates,
    eliminated,
    winner: winnerArr[0] ?? null,
  };
}

/** Versión ligera del estado (solo `version`) para el polling del stream SSE. */
export async function getDuelVersion(userId: string, sessionId: string): Promise<number | null> {
  const s = await prisma.duelSession.findUnique({
    where: { id: sessionId },
    select: { version: true, participants: { select: { userId: true } } },
  });
  if (!s || !s.participants.some((p) => p.userId === userId)) return null;
  return s.version;
}

/** Partidas del usuario para la bandeja de invitaciones/activas. */
export async function listDuels(userId: string) {
  const sessions = await prisma.duelSession.findMany({
    where: { participants: { some: { userId } }, status: { in: ["WAITING", "ACTIVE"] } },
    include: { participants: { include: { user: { select: { id: true, name: true, email: true } } }, orderBy: { order: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });
  return sessions.map((s) => {
    const me = s.participants.find((p) => p.userId === userId)!;
    const others = s.participants.filter((p) => p.userId !== userId).map((p) => p.user.name ?? p.user.email);
    return {
      id: s.id,
      status: s.status,
      isHost: s.hostId === userId,
      accepted: me.accepted,
      myTurn: s.turnUserId === userId,
      opponents: others,
    };
  });
}
