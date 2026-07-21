import "server-only";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import { prisma } from "@/lib/db";
import type { User } from "@prisma/client";

const SESSION_COOKIE = "chef_session";
const EXPIRES_IN_MS = 60 * 60 * 24 * 14 * 1000; // 14 días

/** Crea la cookie de sesión httpOnly a partir de un ID token de Firebase. */
export async function createSession(idToken: string): Promise<void> {
  const sessionCookie = await adminAuth().createSessionCookie(idToken, { expiresIn: EXPIRES_IN_MS });
  const store = await cookies();
  store.set(SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: EXPIRES_IN_MS / 1000,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Verifica la cookie de sesión y devuelve el `User` de Prisma, haciendo upsert
 * en el primer acceso (Firebase = identidad, Postgres = datos).
 */
export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;

  try {
    const decoded = await adminAuth().verifySessionCookie(cookie, true);
    return await prisma.user.upsert({
      where: { firebaseUid: decoded.uid },
      update: {},
      create: {
        firebaseUid: decoded.uid,
        email: decoded.email ?? `${decoded.uid}@sin-email.local`,
        name: decoded.name ?? null,
      },
    });
  } catch {
    return null;
  }
}
