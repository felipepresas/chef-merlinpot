"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X, Clock, Loader2, UtensilsCrossed, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { DAYS_ES, MEALS, MEAL_LABEL } from "@/lib/plan-labels";
import type { MealType } from "@prisma/client";

type SlotRecipe = { id: string; title: string; slug: string } | null;
type Slot = { slotId: string; dayOfWeek: number; mealType: MealType; recipe: SlotRecipe };
type Recipe = { id: string; slug: string; title: string; mealType: MealType; cookTimeMin: number | null; cuisine: string | null };

export function WeekGrid({ initialSlots }: { initialSlots: Slot[] }) {
  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [openSlot, setOpenSlot] = useState<Slot | null>(null);

  const recipes = useQuery<Recipe[]>({
    queryKey: ["recipes", openSlot?.mealType],
    enabled: !!openSlot,
    queryFn: async () => {
      const res = await fetch(`/api/recetas?meal=${openSlot!.mealType}`);
      if (!res.ok) throw new Error();
      return res.json();
    },
  });

  const assign = useMutation({
    mutationFn: async (vars: { slotId: string; recipe: SlotRecipe }) => {
      const res = await fetch("/api/plan/slot", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: vars.slotId, recipeId: vars.recipe?.id ?? null }),
      });
      if (!res.ok) throw new Error();
      return (await res.json()) as { recipe: SlotRecipe };
    },
    // Optimista: pinta el cambio ya y cierra el diálogo; guarda el estado previo para revertir.
    onMutate: (vars) => {
      const prev = slots;
      setSlots((s) => s.map((x) => (x.slotId === vars.slotId ? { ...x, recipe: vars.recipe } : x)));
      setOpenSlot(null);
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) setSlots(ctx.prev);
      toast.error("No se pudo guardar el cambio.");
    },
    onSuccess: (data, vars) => {
      // reconcilia con lo que confirma el servidor
      setSlots((s) => s.map((x) => (x.slotId === vars.slotId ? { ...x, recipe: data.recipe } : x)));
    },
  });

  const fill = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/plan/fill", { method: "POST" });
      if (!res.ok) throw new Error();
      return (await res.json()) as { filled: { slotId: string; recipe: SlotRecipe }[] };
    },
    onSuccess: (data) => {
      const byId = new Map(data.filled.map((f) => [f.slotId, f.recipe]));
      setSlots((prev) => prev.map((s) => (byId.has(s.slotId) ? { ...s, recipe: byId.get(s.slotId)! } : s)));
      if (data.filled.length === 0) {
        toast.info("No quedan huecos por rellenar (o no hay recetas para tu dieta).");
      } else {
        toast.success(`✨ Rellené ${data.filled.length} ${data.filled.length === 1 ? "hueco" : "huecos"}.`);
      }
    },
    onError: () => toast.error("No se pudo rellenar la semana."),
  });

  const emptyCount = slots.filter((s) => !s.recipe).length;
  const allEmpty = slots.length > 0 && emptyCount === slots.length;

  const slotFor = (day: number, meal: MealType) =>
    slots.find((s) => s.dayOfWeek === day && s.mealType === meal);

  return (
    <>
      {allEmpty && (
        <div className="mb-4 rounded-2xl border border-brand/15 bg-brand/5 p-5 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Sparkles className="h-5 w-5" />
          </span>
          <h2 className="mt-3 font-semibold text-ink">Tu semana está en blanco</h2>
          <p className="mx-auto mt-1 max-w-xs text-sm text-ink/60">
            Deja que el mago la llene por ti, o añade tú los platos uno a uno.
          </p>
        </div>
      )}
      <button
        onClick={() => fill.mutate()}
        disabled={fill.isPending || emptyCount === 0}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {fill.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {emptyCount === 0
          ? "Semana completa"
          : `Rellena mi semana${emptyCount < slots.length ? ` (${emptyCount})` : ""}`}
      </button>

      <div className="space-y-3">
        {DAYS_ES.map((dayName, day) => (
          <div key={day} className="rounded-2xl border border-ink/5 bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold text-ink">{dayName}</h2>
            <div className="grid grid-cols-2 gap-3">
              {MEALS.map((meal) => {
                const slot = slotFor(day, meal);
                if (!slot) return null;
                return (
                  <div key={meal} className="rounded-xl bg-cream p-3">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink/40">
                      {MEAL_LABEL[meal]}
                    </p>
                    {slot.recipe ? (
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/recetas/${slot.recipe.slug}`}
                          className="text-sm font-medium text-ink hover:text-brand hover:underline"
                        >
                          {slot.recipe.title}
                        </Link>
                        <button
                          aria-label="Quitar"
                          onClick={() => assign.mutate({ slotId: slot.slotId, recipe: null })}
                          className="shrink-0 text-ink/30 hover:text-paprika"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setOpenSlot(slot)}
                        className="flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-700"
                      >
                        <Plus className="h-4 w-4" /> Añadir
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Dialog.Root open={!!openSlot} onOpenChange={(o) => !o && setOpenSlot(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[75dvh] max-w-2xl overflow-y-auto rounded-t-3xl bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <Dialog.Title className="text-lg font-bold text-ink">
                Elige una receta
                {openSlot && (
                  <span className="ml-2 text-sm font-normal text-ink/50">
                    {DAYS_ES[openSlot.dayOfWeek]} · {MEAL_LABEL[openSlot.mealType]}
                  </span>
                )}
              </Dialog.Title>
              <Dialog.Close className="text-ink/40 hover:text-ink">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            {recipes.isLoading && (
              <div className="flex justify-center py-10 text-ink/40">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}

            {recipes.data && recipes.data.length === 0 && (
              <p className="py-8 text-center text-sm text-ink/50">Aún no hay recetas en el catálogo.</p>
            )}

            <div className="space-y-2">
              {recipes.data?.map((r) => (
                <button
                  key={r.id}
                  disabled={assign.isPending}
                  onClick={() =>
                    openSlot &&
                    assign.mutate({
                      slotId: openSlot.slotId,
                      recipe: { id: r.id, title: r.title, slug: r.slug },
                    })
                  }
                  className="flex w-full items-center gap-3 rounded-xl border border-ink/5 bg-cream p-3 text-left transition hover:border-brand disabled:opacity-60"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <UtensilsCrossed className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{r.title}</span>
                    <span className="flex items-center gap-2 text-xs text-ink/50">
                      {r.cuisine && <span>{r.cuisine}</span>}
                      {r.cookTimeMin != null && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {r.cookTimeMin} min
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
