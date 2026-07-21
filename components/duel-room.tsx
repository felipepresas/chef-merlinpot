"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import * as Dialog from "@radix-ui/react-dialog";
import { Sparkles, Clock, Trophy, Loader2, X, Check, ArrowLeft, CalendarPlus, Ban, Hourglass } from "lucide-react";
import { toast } from "sonner";
import { DAYS_ES, MEAL_LABEL } from "@/lib/plan-labels";
import type { DuelStateView } from "@/lib/duel";
import type { MealType } from "@prisma/client";

type Slot = { slotId: string; dayOfWeek: number; mealType: MealType; recipeTitle: string | null };

// Hook: estado de la partida vía SSE, con fallback a polling si el stream falla.
function useDuelState(id: string) {
  const [state, setState] = useState<DuelStateView | null>(null);
  useEffect(() => {
    let cancelled = false;
    let es: EventSource | null = null;
    let poll: ReturnType<typeof setInterval> | null = null;

    const fetchOnce = async () => {
      const r = await fetch(`/api/duelo/${id}`);
      if (r.ok && !cancelled) setState(await r.json());
    };
    const startPolling = () => {
      if (!poll) poll = setInterval(fetchOnce, 2000);
    };

    fetchOnce();
    try {
      es = new EventSource(`/api/duelo/${id}/stream`);
      es.onmessage = (e) => {
        if (!cancelled) setState(JSON.parse(e.data));
      };
      es.onerror = () => {
        es?.close();
        startPolling();
      };
    } catch {
      startPolling();
    }

    return () => {
      cancelled = true;
      es?.close();
      if (poll) clearInterval(poll);
    };
  }, [id]);

  return state;
}

async function action(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/duelo/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error ?? "Error");
  }
}

export function DuelRoom({ sessionId }: { sessionId: string }) {
  const state = useDuelState(sessionId);
  const [pending, setPending] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const slots = useQuery<Slot[]>({
    queryKey: ["plan-slots"],
    enabled: assignOpen,
    queryFn: async () => (await fetch("/api/plan/slots")).json(),
  });

  async function run(body: Record<string, unknown>) {
    setPending(true);
    try {
      await action(sessionId, body);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setPending(false);
    }
  }

  async function assignTo(slotId: string) {
    if (!state?.winner) return;
    const res = await fetch("/api/plan/slot", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId, recipeId: state.winner.id }),
    });
    if (res.ok) {
      toast.success(`${state.winner.title} añadido a tu semana`);
      setAssignOpen(false);
    } else toast.error("No se pudo añadir.");
  }

  const back = (
    <Link href="/duelo" className="mb-4 inline-flex items-center gap-1 text-sm text-ink/50 hover:text-brand">
      <ArrowLeft className="h-4 w-4" /> El Duelo
    </Link>
  );

  if (!state) {
    return (
      <div className="flex justify-center py-16 text-ink/40">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const opponent = state.participants.find((p) => !p.isMe);

  // ── CANCELADA ──
  if (state.status === "CANCELLED") {
    return (
      <div className="py-4">
        {back}
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink/10 p-10 text-center text-ink/50">
          <Ban className="h-8 w-8" />
          <p className="text-sm">Esta partida se canceló.</p>
        </div>
      </div>
    );
  }

  // ── ESPERANDO ──
  if (state.status === "WAITING") {
    const me = state.participants.find((p) => p.isMe);
    const iAccepted = me?.accepted;
    return (
      <div className="py-4">
        {back}
        <div className="mt-6 flex flex-col items-center gap-4 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <Sparkles className="h-8 w-8" />
          </span>
          {iAccepted ? (
            <>
              <Hourglass className="h-5 w-5 animate-pulse text-ink/40" />
              <p className="text-ink/70">
                Esperando a que <b>{opponent?.name}</b> acepte el duelo…
              </p>
              <button onClick={() => run({ action: "cancel" })} disabled={pending} className="mt-2 text-sm text-ink/50 hover:text-paprika">
                Cancelar
              </button>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-ink">
                <b>{opponent?.name}</b> te reta a un duelo
              </h1>
              <p className="text-sm text-ink/60">
                {state.mealType ? MEAL_LABEL[state.mealType] : "Cualquier comida"} · ¿decidís juntos qué comer?
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => run({ action: "accept" })}
                  disabled={pending}
                  className="flex items-center gap-2 rounded-xl bg-brand px-5 py-3 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
                >
                  <Check className="h-4 w-4" /> Aceptar
                </button>
                <button
                  onClick={() => run({ action: "cancel" })}
                  disabled={pending}
                  className="rounded-xl border border-ink/10 px-5 py-3 font-medium text-ink hover:border-paprika"
                >
                  Rechazar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── CAMPEÓN ──
  if (state.status === "FINISHED" && state.winner) {
    return (
      <div className="py-4">
        {back}
        <div className="flex flex-col items-center pt-4 text-center">
          <span className="flex items-center gap-2 rounded-full bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand">
            <Sparkles className="h-4 w-4" /> Habéis decidido
          </span>
          <div className="mt-6 w-full max-w-sm rounded-3xl border border-brand/20 bg-white p-8 shadow-sm">
            <Trophy className="mx-auto h-10 w-10 text-paprika" />
            <h2 className="mt-4 text-2xl font-bold text-ink">{state.winner.title}</h2>
            <p className="mt-1 text-sm text-ink/50">
              {state.winner.cuisine}
              {state.winner.cookTimeMin != null && ` · ${state.winner.cookTimeMin} min`}
            </p>
          </div>
          <div className="mt-6 flex w-full max-w-sm flex-col gap-3">
            <button
              onClick={() => setAssignOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 font-medium text-white hover:bg-brand-700"
            >
              <CalendarPlus className="h-4 w-4" /> Añadir a mi semana
            </button>
            <Link
              href={`/recetas/${state.winner.slug}`}
              className="rounded-xl border border-ink/10 bg-white px-4 py-3 text-center font-medium text-ink hover:border-brand"
            >
              Ver receta
            </Link>
          </div>
        </div>

        <Dialog.Root open={assignOpen} onOpenChange={setAssignOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm" />
            <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[75dvh] max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 text-left shadow-xl">
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
                    <span className="text-xs text-ink/50">{s.recipeTitle ?? "libre"}</span>
                  </button>
                ))}
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    );
  }

  // ── ACTIVA (tablero de veto) ──
  const turnName = state.participants.find((p) => p.isTurn)?.name;
  return (
    <div className="py-4">
      {back}
      <div className="mb-5 text-center">
        <p className="text-sm font-medium text-ink/50">Quedan {state.candidates.length} platos</p>
        {state.myTurn ? (
          <h1 className="mt-1 text-xl font-bold text-brand">Tu turno · quita el que menos te apetezca</h1>
        ) : (
          <h1 className="mt-1 inline-flex items-center gap-2 text-xl font-bold text-ink/60">
            <Loader2 className="h-4 w-4 animate-spin" /> Turno de {turnName}…
          </h1>
        )}
      </div>

      <div className="space-y-3">
        {state.candidates.map((r) => (
          <button
            key={r.id}
            disabled={!state.myTurn || pending}
            onClick={() => run({ action: "veto", recipeId: r.id })}
            className="group flex w-full items-center justify-between rounded-2xl border-2 border-ink/5 bg-white p-5 text-left transition enabled:hover:border-paprika disabled:opacity-70"
          >
            <span>
              <span className="block font-bold text-ink">{r.title}</span>
              <span className="flex items-center gap-2 text-sm text-ink/50">
                {r.cuisine && <span>{r.cuisine}</span>}
                {r.cookTimeMin != null && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {r.cookTimeMin} min
                  </span>
                )}
              </span>
            </span>
            {state.myTurn && (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paprika/10 text-paprika opacity-0 transition group-hover:opacity-100">
                <X className="h-4 w-4" />
              </span>
            )}
          </button>
        ))}
      </div>

      {state.eliminated.length > 0 && (
        <div className="mt-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/30">Descartados</p>
          <p className="text-sm text-ink/30 line-through">{state.eliminated.map((r) => r.title).join(" · ")}</p>
        </div>
      )}
    </div>
  );
}
