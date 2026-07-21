import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// SDK admin (servidor). Se inicializa perezosamente para no romper el build
// cuando faltan las variables (p.ej. generación estática).
let cached: App | undefined;

function getAdminApp(): App {
  if (cached) return cached;
  if (getApps().length) return (cached = getApps()[0]);

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Faltan credenciales de Firebase Admin (FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY)");
  }

  cached = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  return cached;
}

export const adminAuth = () => getAuth(getAdminApp());
