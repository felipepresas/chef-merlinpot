"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/** Traduce el código de error de Firebase Auth a un mensaje claro. */
function authErrorMessage(code: string | undefined, mode: "login" | "register"): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "Ese email ya tiene cuenta. Entra en su lugar.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email o contraseña incorrectos.";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres.";
    case "auth/invalid-email":
      return "Ese email no es válido.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Prueba de nuevo en un rato.";
    default:
      return mode === "login" ? "No se pudo iniciar sesión." : "No se pudo crear la cuenta.";
  }
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">(
    searchParams.get("mode") === "register" ? "register" : "login",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const fn =
        mode === "login" ? signInWithEmailAndPassword : createUserWithEmailAndPassword;
      const cred = await fn(getFirebaseAuth(), email, password);
      const idToken = await cred.user.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) throw new Error("session");
      toast.success(mode === "login" ? "¡Bienvenido de vuelta!" : "¡Cuenta creada!");
      router.push("/semana");
      router.refresh();
    } catch (err) {
      const code = (err as { code?: string })?.code;
      toast.error(authErrorMessage(code, mode));
    } finally {
      setLoading(false);
    }
  }

  async function onReset() {
    if (!email.trim()) {
      toast.info("Escribe tu email arriba y te enviamos el enlace.");
      return;
    }
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
      toast.success("Te enviamos un email para restablecer la contraseña.");
    } catch (err) {
      toast.error(authErrorMessage((err as { code?: string })?.code, "login"));
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-16">
      <div className="mb-8 text-center">
        <Badge className="px-4 py-1.5 text-sm font-medium">
          <Sparkles className="h-4 w-4" /> Chef
        </Badge>
        <h1 className="mt-6 font-display text-3xl font-semibold text-ink">
          {mode === "login" ? "Entra a tu cocina" : "Crea tu cuenta"}
        </h1>
        <p className="mt-1 text-sm text-ink/60">Tu semana, servida.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-ink/10 bg-card px-4 py-3 text-ink outline-none focus:border-brand"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-ink/10 bg-card px-4 py-3 text-ink outline-none focus:border-brand"
        />
        <Button type="submit" fullWidth loading={loading}>
          {mode === "login" ? "Entrar" : "Crear cuenta"}
        </Button>
      </form>

      {mode === "login" && (
        <button
          type="button"
          onClick={onReset}
          className="mt-4 text-center text-sm text-ink/50 hover:text-brand"
        >
          ¿Olvidaste la contraseña?
        </button>
      )}

      <button
        type="button"
        onClick={() => setMode(mode === "login" ? "register" : "login")}
        className="mt-6 text-center text-sm text-ink/60 hover:text-brand"
      >
        {mode === "login"
          ? "¿No tienes cuenta? Regístrate"
          : "¿Ya tienes cuenta? Entra"}
      </button>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
