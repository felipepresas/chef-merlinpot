import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { ArrowRight, CalendarDays, ShoppingCart, Sparkles, Video } from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Tu semana planificada",
    body: "Almuerzos y cenas de lunes a domingo, de un vistazo.",
  },
  {
    icon: Video,
    title: "Receta con vídeo",
    body: "Ingredientes, pasos y el vídeo de YouTube para cocinar sin dudas.",
  },
  {
    icon: ShoppingCart,
    title: "Lista de la compra",
    body: "Se genera sola desde tu semana y se agrupa por pasillos.",
  },
  {
    icon: Sparkles,
    title: "El Duelo",
    body: "¿Indeciso? Deja que el mago elija por ti, plato a plato.",
  },
];

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/semana");

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center px-6 py-16 text-center">
      <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand">
        <Sparkles className="h-4 w-4" /> by merlinpot
      </span>

      <h1 className="mt-8 text-5xl font-bold tracking-tight text-ink">
        Chef
      </h1>
      <p className="mt-4 text-xl text-ink/70">Tu semana, servida.</p>
      <p className="mt-2 max-w-md text-ink/60">
        El planificador mágico de comidas de la semana.
      </p>

      <Link
        href="/login"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700"
      >
        Empezar <ArrowRight className="h-4 w-4" />
      </Link>
      <Link href="/login" className="mt-3 text-sm text-ink/50 hover:text-brand">
        Ya tengo cuenta
      </Link>

      <div className="mt-12 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {features.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-2xl border border-ink/5 bg-card p-5 text-left shadow-sm"
          >
            <Icon className="h-6 w-6 text-paprika" />
            <h2 className="mt-3 font-semibold text-ink">{title}</h2>
            <p className="mt-1 text-sm text-ink/60">{body}</p>
          </div>
        ))}
      </div>

      <p className="mt-16 text-sm text-ink/40">
        chef.merlinpot.com · by merlinpot
      </p>
    </main>
  );
}
