"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Target, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { GOALS, GOAL_LABEL, GOAL_HELP } from "@/lib/goal-labels";
import type { Goal } from "@prisma/client";

export function GoalSection() {
  const qc = useQueryClient();

  const goalQ = useQuery<Goal | null>({
    queryKey: ["goal"],
    queryFn: async () => {
      const d = (await (await fetch("/api/goal")).json()) as { goal: Goal | null };
      return d.goal ?? null;
    },
  });

  const save = useMutation({
    mutationFn: async (next: Goal | null) => {
      const res = await fetch("/api/goal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: next }),
      });
      if (!res.ok) throw new Error();
      return ((await res.json()) as { goal: Goal | null }).goal;
    },
    onSuccess: (saved) => {
      qc.setQueryData(["goal"], saved);
      qc.invalidateQueries({ queryKey: ["recipes"] }); // el selector re-muestra kcal
      toast.success(saved ? "Objetivo actualizado" : "Objetivo desactivado");
    },
    onError: () => toast.error("No se pudo guardar."),
  });

  const current = goalQ.data ?? null;

  const chip = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition disabled:opacity-60 ${
      active ? "border-brand bg-brand/10 text-brand" : "border-ink/10 text-ink/60 hover:border-ink/30"
    }`;

  return (
    <section className="rounded-2xl border border-ink/5 bg-card p-4">
      <h2 className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-ink">
        <Target className="h-4 w-4 text-brand" /> Tu objetivo
      </h2>
      <p className="mb-3 text-xs text-ink/50">
        Opcional. Si lo activas, verás las calorías de cada plato y «Rellena mi semana» tendrá en cuenta tu objetivo.
      </p>

      {goalQ.isLoading ? (
        <div className="flex justify-center py-3 text-ink/40">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((g) => {
              const on = current === g;
              return (
                <button key={g} onClick={() => save.mutate(g)} disabled={save.isPending} className={chip(on)}>
                  {on && <Check className="h-3.5 w-3.5" />}
                  {GOAL_LABEL[g]}
                </button>
              );
            })}
            <button
              onClick={() => save.mutate(null)}
              disabled={save.isPending || current === null}
              className={chip(current === null)}
            >
              Sin objetivo
            </button>
          </div>
          {current && <p className="mt-2 text-xs text-ink/50">{GOAL_HELP[current]}</p>}
        </>
      )}
    </section>
  );
}
