"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import * as Dialog from "@radix-ui/react-dialog";
import { Sparkles, Clock, Trophy, RotateCcw, CalendarPlus, X, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { DAYS_ES, MEAL_LABEL } from "@/lib/plan-labels";
import type { MealType } from "@prisma/client";

type Recipe = { id: string; slug: string; title: string; mealType: MealType; cookTimeMin: number | null; cuisine: string | null };
type Slot = { slotId: string; dayOfWeek: number; mealType: MealType; recipeTitle: string | null };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function DueloGame() {
  const [phase, setPhase] = useState<"setup" | "playing">("setup");
  const [round, setRound] = useState<Recipe[]>([]);
  const [winners, setWinners] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const champion = phase === "playing" && round.length === 1 && winners.length === 0 ? round[0] : null;
  const pair = round.length >= 2 ? ([round[0], round[1]] as const) : null;
  const remaining = round.length + winners.length;

  async function start(meal?: MealType) {
    setLoading(true);
    try {
      const res = await fetch(`/api/recetas${meal ? `?meal=${meal}` : ""}`);
      const recipes: Recipe[] = await res.json();
      if (!Array.isArray(recipes) || recipes.length < 2) {
        toast.error("Necesitas al menos 2 recetas para El Duelo.");
        return;
      }
      setRound(shuffle(recipes).slice(0, 8));
      setWinners([]);
      setPhase("playing");
    } finally {
      setLoading(false);
    }
  }

  function choose(winner: Recipe) {
    const rest = round.slice(2);
    let nextWinners = [...winners, winner];
    let nextRound = rest;
    if (nextRound.length === 1) {
      // impar: el que sobra pasa de ronda directo
      nextWinners = [...nextWinners, nextRound[0]];
      nextRound = [];
    }
    if (nextRound.length === 0) {
      if (nextWinners.length === 1) {
        setRound(nextWinners);
        setWinners([]);
        return;
      }
      nextRound = nextWinners;
      nextWinners = [];
    }
    setRound(nextRound);
    setWinners(nextWinners);
  }

  function reset() {
    setPhase("setup");
    setRound([]);
    setWinners([]);
  }

  const slots = useQuery<Slot[]>({
    queryKey: ["plan-slots"],
    enabled: assignOpen,
    queryFn: async () => (await fetch("/api/plan/slots")).json(),
  });

  async function assignTo(slotId: string) {
    if (!champion) return;
    const res = await fetch("/api/plan/slot", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId, recipeId: champion.id }),
    });
    if (res.ok) {
      toast.success(`${champion.title} añadido a tu semana`);
      setAssignOpen(false);
    } else {
      toast.error("No se pudo añadir.");
    }
  }

  // ── SETUP ──────────────────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <Sparkles className="h-8 w-8" />
        </span>
        <h1 className="mt-6 text-2xl font-bold text-ink">El Duelo</h1>
        <p className="mt-2 max-w-xs text-ink/60">
          ¿No sabes qué comer? Enfrenta los platos y deja que el mago elija por ti.
        </p>
        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          <button
            onClick={() => start("LUNCH")}
            disabled={loading}
            className="rounded-xl border border-ink/10 bg-card px-4 py-3 font-medium text-ink transition hover:border-brand disabled:opacity-60"
          >
            Duelo de almuerzos
          </button>
          <button
            onClick={() => start("DINNER")}
            disabled={loading}
            className="rounded-xl border border-ink/10 bg-card px-4 py-3 font-medium text-ink transition hover:border-brand disabled:opacity-60"
          >
            Duelo de cenas
          </button>
          <button
            onClick={() => start()}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Sorpréndeme
          </button>
        </div>
      </div>
    );
  }

  // ── CAMPEÓN ────────────────────────────────────────────────────────
  if (champion) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <span className="flex items-center gap-2 rounded-full bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand">
          <Sparkles className="h-4 w-4" /> El mago ha elegido
        </span>
        <div className="mt-6 w-full max-w-sm rounded-3xl border border-brand/20 bg-card p-8 shadow-sm">
          <Trophy className="mx-auto h-10 w-10 text-paprika" />
          <h2 className="mt-4 text-2xl font-bold text-ink">{champion.title}</h2>
          <p className="mt-1 text-sm text-ink/50">
            {champion.cuisine}
            {champion.cookTimeMin != null && ` · ${champion.cookTimeMin} min`}
          </p>
        </div>

        <div className="mt-6 flex w-full max-w-sm flex-col gap-3">
          <button
            onClick={() => setAssignOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 font-medium text-white transition hover:bg-brand-700"
          >
            <CalendarPlus className="h-4 w-4" /> Añadir a mi semana
          </button>
          <Link
            href={`/recetas/${champion.slug}`}
            className="rounded-xl border border-ink/10 bg-card px-4 py-3 text-center font-medium text-ink transition hover:border-brand"
          >
            Ver receta
          </Link>
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 py-2 text-sm text-ink/50 hover:text-brand"
          >
            <RotateCcw className="h-4 w-4" /> Jugar otra vez
          </button>
        </div>

        <Dialog.Root open={assignOpen} onOpenChange={setAssignOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm" />
            <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[75dvh] max-w-2xl overflow-y-auto rounded-t-3xl bg-card p-6 text-left shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <Dialog.Title className="text-lg font-bold text-ink">¿En qué hueco?</Dialog.Title>
                <Dialog.Close className="text-ink/40 hover:text-ink">
                  <X className="h-5 w-5" />
                </Dialog.Close>
              </div>
              {slots.isLoading && (
                <div className="flex justify-center py-8 text-ink/40">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
              <div className="space-y-2">
                {slots.data?.map((s) => (
                  <button
                    key={s.slotId}
                    onClick={() => assignTo(s.slotId)}
                    className="flex w-full items-center justify-between rounded-xl border border-ink/5 bg-cream px-4 py-3 text-left transition hover:border-brand"
                  >
                    <span className="text-sm font-medium text-ink">
                      {DAYS_ES[s.dayOfWeek]} · {MEAL_LABEL[s.mealType]}
                    </span>
                    <span className="text-xs text-ink/50">
                      {s.recipeTitle ? (
                        s.recipeTitle
                      ) : (
                        <span className="inline-flex items-center gap-1 text-brand">
                          <Check className="h-3 w-3" /> libre
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    );
  }

  // ── DUELO ──────────────────────────────────────────────────────────
  return (
    <div className="py-6">
      <div className="mb-6 text-center">
        <p className="text-sm font-medium text-ink/50">Quedan {remaining} platos en liza</p>
        <h1 className="mt-1 text-xl font-bold text-ink">¿Cuál te apetece más?</h1>
      </div>

      {pair && (
        <div className="flex flex-col items-stretch gap-3">
          {[pair[0], pair[1]].map((r, idx) => (
            <div key={r.id} className="contents">
              <button
                onClick={() => choose(r)}
                className="group rounded-2xl border-2 border-ink/5 bg-card p-6 text-center transition hover:border-brand hover:shadow-md"
              >
                <h2 className="text-lg font-bold text-ink group-hover:text-brand">{r.title}</h2>
                <p className="mt-1 flex items-center justify-center gap-2 text-sm text-ink/50">
                  {r.cuisine && <span>{r.cuisine}</span>}
                  {r.cookTimeMin != null && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {r.cookTimeMin} min
                    </span>
                  )}
                </p>
              </button>
              {idx === 0 && (
                <div className="flex items-center justify-center">
                  <span className="rounded-full bg-paprika/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-paprika">
                    vs
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={reset}
        className="mx-auto mt-8 flex items-center gap-2 py-2 text-sm text-ink/40 hover:text-brand"
      >
        <RotateCcw className="h-4 w-4" /> Empezar de nuevo
      </button>
    </div>
  );
}
