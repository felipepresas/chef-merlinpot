import "server-only";
import { prisma } from "@/lib/db";

const userSelect = { id: true, name: true, email: true } as const;

export type FriendView = { friendshipId: string; userId: string; name: string | null; email: string };
export type RequestView = { friendshipId: string; name: string | null; email: string };
export type FriendData = { friends: FriendView[]; incoming: RequestView[]; outgoing: RequestView[] };

/** Amigos aceptados + solicitudes entrantes y salientes del usuario. */
export async function getFriendData(userId: string): Promise<FriendData> {
  const rows = await prisma.friendship.findMany({
    where: { OR: [{ requesterId: userId }, { addresseeId: userId }] },
    include: { requester: { select: userSelect }, addressee: { select: userSelect } },
    orderBy: { createdAt: "desc" },
  });

  const friends: FriendView[] = [];
  const incoming: RequestView[] = [];
  const outgoing: RequestView[] = [];

  for (const f of rows) {
    const other = f.requesterId === userId ? f.addressee : f.requester;
    if (f.status === "ACCEPTED") {
      friends.push({ friendshipId: f.id, userId: other.id, name: other.name, email: other.email });
    } else if (f.addresseeId === userId) {
      incoming.push({ friendshipId: f.id, name: f.requester.name, email: f.requester.email });
    } else {
      outgoing.push({ friendshipId: f.id, name: f.addressee.name, email: f.addressee.email });
    }
  }
  return { friends, incoming, outgoing };
}

/** Envía una solicitud de amistad por email. */
export async function sendFriendRequest(userId: string, email: string): Promise<{ ok: true } | { error: string }> {
  const target = await prisma.user.findFirst({ where: { email: { equals: email.trim(), mode: "insensitive" } } });
  if (!target) return { error: "No hay ninguna cuenta con ese email." };
  if (target.id === userId) return { error: "No puedes agregarte a ti mismo." };

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: userId, addresseeId: target.id },
        { requesterId: target.id, addresseeId: userId },
      ],
    },
  });
  if (existing) {
    return { error: existing.status === "ACCEPTED" ? "Ya sois amigos." : "Ya hay una solicitud pendiente." };
  }

  await prisma.friendship.create({ data: { requesterId: userId, addresseeId: target.id } });
  return { ok: true };
}

/** Acepta o rechaza una solicitud entrante (solo el destinatario). */
export async function respondFriendRequest(
  userId: string,
  friendshipId: string,
  accept: boolean,
): Promise<{ ok: true } | { error: string }> {
  const f = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!f || f.addresseeId !== userId || f.status !== "PENDING") return { error: "Solicitud no encontrada." };
  if (accept) await prisma.friendship.update({ where: { id: friendshipId }, data: { status: "ACCEPTED" } });
  else await prisma.friendship.delete({ where: { id: friendshipId } });
  return { ok: true };
}

/** Elimina una amistad o cancela una solicitud (cualquiera de las dos partes). */
export async function removeFriendship(userId: string, friendshipId: string): Promise<{ ok: true } | { error: string }> {
  const f = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!f || (f.requesterId !== userId && f.addresseeId !== userId)) return { error: "No encontrado." };
  await prisma.friendship.delete({ where: { id: friendshipId } });
  return { ok: true };
}

/** ¿Son amigos aceptados estos dos usuarios? (para invitar a duelos) */
export async function areFriends(a: string, b: string): Promise<boolean> {
  const f = await prisma.friendship.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: a, addresseeId: b },
        { requesterId: b, addresseeId: a },
      ],
    },
  });
  return !!f;
}
