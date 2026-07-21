import "server-only";
import { prisma } from "@/lib/db";
import { areFriends } from "@/lib/friends";

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

const memberSelect = { id: true, name: true, email: true } as const;

export type HouseholdData = {
  householdId: string;
  members: { userId: string; name: string | null; email: string; isMe: boolean }[];
  incoming: { inviteId: string; from: string; householdId: string }[];
  outgoing: { inviteId: string; to: string }[];
};

export async function getHouseholdData(userId: string): Promise<HouseholdData> {
  const householdId = await getHouseholdId(userId);
  const [members, incoming, outgoing] = await Promise.all([
    prisma.user.findMany({ where: { householdId }, select: memberSelect, orderBy: { createdAt: "asc" } }),
    prisma.householdInvite.findMany({ where: { inviteeId: userId }, include: { inviter: { select: memberSelect } } }),
    prisma.householdInvite.findMany({ where: { householdId }, include: { invitee: { select: memberSelect } } }),
  ]);
  return {
    householdId,
    members: members.map((m) => ({ userId: m.id, name: m.name, email: m.email, isMe: m.id === userId })),
    incoming: incoming.map((i) => ({ inviteId: i.id, from: i.inviter.name ?? i.inviter.email, householdId: i.householdId })),
    outgoing: outgoing.map((o) => ({ inviteId: o.id, to: o.invitee.name ?? o.invitee.email })),
  };
}

/** Invita a un amigo a tu hogar (para compartir el plan y la compra). */
export async function inviteToHousehold(userId: string, friendId: string): Promise<{ ok: true } | { error: string }> {
  if (!(await areFriends(userId, friendId))) return { error: "Solo puedes compartir el hogar con tus amigos." };
  const householdId = await getHouseholdId(userId);
  const friend = await prisma.user.findUnique({ where: { id: friendId }, select: { householdId: true } });
  if (friend?.householdId === householdId) return { error: "Ya compartís hogar." };

  const existing = await prisma.householdInvite.findUnique({
    where: { householdId_inviteeId: { householdId, inviteeId: friendId } },
  });
  if (existing) return { error: "Ya le has invitado." };

  await prisma.householdInvite.create({ data: { householdId, inviterId: userId, inviteeId: friendId } });
  return { ok: true };
}

/** Acepta (te unes al hogar) o rechaza una invitación de hogar. */
export async function respondHouseholdInvite(
  userId: string,
  inviteId: string,
  accept: boolean,
): Promise<{ ok: true } | { error: string }> {
  const invite = await prisma.householdInvite.findUnique({ where: { id: inviteId } });
  if (!invite || invite.inviteeId !== userId) return { error: "Invitación no encontrada." };

  if (accept) {
    // te unes al hogar del invitador; se descartan tus otras invitaciones pendientes
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { householdId: invite.householdId } }),
      prisma.householdInvite.deleteMany({ where: { inviteeId: userId } }),
    ]);
  } else {
    await prisma.householdInvite.delete({ where: { id: inviteId } });
  }
  return { ok: true };
}

/** Cancela una invitación saliente de tu hogar. */
export async function cancelHouseholdInvite(userId: string, inviteId: string): Promise<{ ok: true } | { error: string }> {
  const householdId = await getHouseholdId(userId);
  const invite = await prisma.householdInvite.findUnique({ where: { id: inviteId } });
  if (!invite || invite.householdId !== householdId) return { error: "No encontrada." };
  await prisma.householdInvite.delete({ where: { id: inviteId } });
  return { ok: true };
}

/** Sales del hogar compartido a un hogar personal nuevo (empiezas de cero). */
export async function leaveHousehold(userId: string): Promise<{ ok: true }> {
  const fresh = await prisma.household.create({ data: {} });
  await prisma.user.update({ where: { id: userId }, data: { householdId: fresh.id } });
  return { ok: true };
}
