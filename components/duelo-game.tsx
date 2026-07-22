"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, Clock, Trophy, RotateCcw, CalendarPlus, X, Loader2, Check, Swords } from "lucide-react";
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

/** Nombre de la ronda según cuántos platos siguen vivos. */
function stageName(alive: number): string {
  if (alive >= 5) return "Cuartos";
  if (alive >= 3) return "Semifinal";
  return "Final";
}

/** Lista de rondas de todo el torneo, según el nº inicial de platos. */
function stagesFor(n: number): string[] {
  const s: string[] = [];
  if (n >= 5) s.push("Cuartos");
  if (n >= 3) s.push("Semifinal");
  s.push("Final");
  return s;
}

export function DueloGame() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"setup" | "playing">("setup");
  const [round, setRound] = useState<Recipe[]>([]);
  const [winners, setWinners] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [initialCount, setInitialCount] = useState(0);
  // camino del ganador: para cada plato, a quién ha vencido
  const [beaten, setBeaten] = useState<Record<string, string[]>>({});

  const champion = phase === "playing" && round.length === 1 && winners.length === 0 ? round[0] : null;
  const pair = round.length >= 2 ? ([round[0], round[1]] as const) : null;
  const remaining = round.length + winners.length;
  const stages = stagesFor(initialCount);
  const curStage = stageName(remaining);
  const curStageIdx = stages.indexOf(curStage);
  const championPath = champion ? (beaten[champion.id] ?? []) : [];

  async function start(meal?: MealType) {
    setLoading(true);
    try {
      const res = await fetch(`/api/recetas${meal ? `?meal=${meal}` : ""}`);
      const recipes: Recipe[] = await res.json();
      if (!Array.isArray(recipes) || recipes.length < 2) {
        toast.error("Necesitas al menos 2 recetas para El Duelo.");
        return;
      }
      const picked = shuffle(recipes).slice(0, 8);
      setRound(picked);
      setWinners([]);
      setBeaten({});
      setInitialCount(picked.length);
      setPhase("playing");
    } finally {
      setLoading(false);
    }
  }

  function choose(winner: Recipe) {
    const loser = round[0].id === winner.id ? round[1] : round[0];
    setBeaten((b) => ({ ...b, [winner.id]: [...(b[winner.id] ?? []), loser.title] }));

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
    setBeaten({});
    setInitialCount(0);
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
            className="flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 font-medium text-white transition hover:bg-brand-800 disabled:opacity-60"
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
        <motion.span
          initial={reduce ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-full bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand"
        >
          <Sparkles className="h-4 w-4" /> El mago ha elegido
        </motion.span>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
          className="relative mt-6 w-full max-w-sm"
        >
          {/* resplandor pulsante detrás de la tarjeta */}
          {!reduce && (
            <motion.div
              aria-hidden
              className="absolute -inset-3 rounded-4xl bg-brand/30 blur-2xl"
              animate={{ opacity: [0.35, 0.7, 0.35], scale: [0.98, 1.02, 0.98] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <div className="relative overflow-hidden rounded-3xl border-2 border-brand/30 bg-linear-to-b from-brand/10 to-card p-8 shadow-2xl shadow-brand/25">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-paprika/15 text-paprika">
              <Trophy className="h-8 w-8" />
            </span>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-brand">Campeón</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">{champion.title}</h2>
            <p className="mt-1 text-sm text-ink/50">
              {champion.cuisine}
              {champion.cookTimeMin != null && ` · ${champion.cookTimeMin} min`}
            </p>
            {championPath.length > 0 && (
              <p className="mt-4 border-t border-ink/5 pt-3 text-xs text-ink/50">
                <Swords className="mr-1 inline h-3 w-3 text-ink/30" />
                Venció a {championPath.join(", ")}
              </p>
            )}
          </div>
        </motion.div>

        <div className="mt-6 flex w-full max-w-sm flex-col gap-3">
          <button
            onClick={() => setAssignOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 font-medium text-white transition hover:bg-brand-800"
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
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-brand">
          <Swords className="h-3.5 w-3.5" /> {curStage}
        </span>
        {stages.length > 1 && (
          <div className="mx-auto mt-3 flex items-center justify-center gap-1.5">
            {stages.map((s, i) => (
              <span
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  i < curStageIdx ? "w-1.5 bg-brand/40" : i === curStageIdx ? "w-6 bg-brand" : "w-1.5 bg-ink/15"
                }`}
              />
            ))}
          </div>
        )}
        <h1 className="mt-3 text-xl font-bold text-ink">¿Cuál te apetece más?</h1>
        <p className="mt-1 text-sm text-ink/50">Quedan {remaining} platos en liza</p>
      </div>

      {pair && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${pair[0].id}-${pair[1].id}`}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            className="relative flex flex-col items-stretch gap-3"
          >
            {[pair[0], pair[1]].map((r, idx) => (
              <div key={r.id} className="contents">
                <button
                  onClick={() => choose(r)}
                  className="group rounded-2xl border-2 border-ink/10 bg-card p-6 text-center transition hover:border-brand hover:shadow-lg hover:shadow-brand/20"
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
                  <div className="relative flex items-center justify-center py-1">
                    <span className="h-px flex-1 bg-ink/10" />
                    <span className="mx-3 flex h-9 w-9 items-center justify-center rounded-full bg-paprika text-xs font-black uppercase tracking-wide text-white shadow-lg shadow-paprika/40 ring-4 ring-paprika/15">
                      vs
                    </span>
                    <span className="h-px flex-1 bg-ink/10" />
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
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
