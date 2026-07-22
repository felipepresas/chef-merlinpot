import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import {
  ArrowRight,
  CalendarDays,
  Video,
  ShoppingCart,
  Sparkles,
  Swords,
} from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    n: "01",
    icon: CalendarDays,
    title: "Planifica",
    body: "Coloca almuerzos y cenas de la semana… o deja que el mago la llene por ti con un toque.",
  },
  {
    n: "02",
    icon: Video,
    title: "Cocina",
    body: "Cada receta con sus ingredientes, los pasos y el vídeo para cocinar sin dudas.",
  },
  {
    n: "03",
    icon: ShoppingCart,
    title: "Compra",
    body: "La lista se genera sola desde tu semana y se agrupa por pasillos del súper.",
  },
];

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/semana");

  return (
    <main className="relative overflow-hidden">
      {/* resplandor de marca tras el hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 -top-32 h-80 w-80 -translate-x-1/2 rounded-full bg-brand/20 blur-3xl"
      />

      <div className="relative mx-auto flex max-w-2xl flex-col items-center px-6 pb-20 pt-16 text-center">
        {/* ── Hero ── */}
        <Badge className="px-4 py-1.5 text-sm font-medium">
          <Sparkles className="h-4 w-4" /> by merlinpot
        </Badge>

        <h1 className="mt-8 font-display text-6xl font-semibold tracking-tight text-ink sm:text-7xl">
          Chef
        </h1>
        <p className="mt-4 font-display text-xl italic text-ink/70">Tu semana, servida.</p>
        <p className="mt-4 max-w-md text-balance text-ink/60">
          Menos pensar, mejor comer. Organiza la semana, decide en segundos y deja que la compra
          se genere sola.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Link href="/login" className={buttonClass({ size: "lg" })}>
            Empezar gratis <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/login" className="text-sm text-ink/50 hover:text-brand">
            Ya tengo cuenta
          </Link>
        </div>

        {/* ── Cómo funciona (el loop del producto) ── */}
        <section className="mt-20 w-full">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-ink/40">Así funciona</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {steps.map(({ n, icon: Icon, title, body }) => (
              <div
                key={n}
                className="flex flex-col items-start rounded-2xl border border-ink/5 bg-card p-5 text-left shadow-sm"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-2xl text-ink/15">{n}</span>
                </div>
                <h3 className="mt-4 font-semibold text-ink">{title}</h3>
                <p className="mt-1 text-sm text-ink/60">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── El Duelo (el diferenciador) ── */}
        <section className="relative mt-6 w-full overflow-hidden rounded-3xl border border-brand/20 bg-linear-to-b from-brand/10 to-card p-8 text-left shadow-sm">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-paprika/20 blur-3xl"
          />
          <div className="relative">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/15 text-brand">
              <Swords className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-display text-2xl font-semibold text-ink">
              ¿No sabes qué comer? El Duelo.
            </h2>
            <p className="mt-2 max-w-md text-sm text-ink/60">
              Enfrenta los platos cara a cara y el mago elige por ti, plato a plato, hasta que
              queda un campeón. Decisivo, rápido y con su punto de magia.
            </p>
          </div>
        </section>

        {/* ── Cierre ── */}
        <section className="mt-16 flex flex-col items-center">
          <p className="font-display text-3xl font-semibold text-ink">Tu semana, servida.</p>
          <Link href="/login" className={buttonClass({ size: "lg", className: "mt-6" })}>
            Empezar gratis <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <p className="mt-16 text-sm text-ink/40">chef.merlinpot.com · by merlinpot</p>
      </div>
    </main>
  );
}
