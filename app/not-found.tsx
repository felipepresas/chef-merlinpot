import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
        <Sparkles className="h-7 w-7" />
      </span>
      <h1 className="mt-6 text-2xl font-bold text-ink">Aquí no hay nada que cocinar</h1>
      <p className="mt-2 text-sm text-ink/60">
        La página que buscas no existe o se movió de la cocina.
      </p>
      <Link
        href="/semana"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-800"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a mi semana
      </Link>
    </main>
  );
}
