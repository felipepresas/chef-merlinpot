"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Salad, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { DIET_TAGS, DIET_LABEL } from "@/lib/diet-labels";
import type { DietTag } from "@prisma/client";

export function DietSection() {
  const qc = useQueryClient();

  const diets = useQuery<DietTag[]>({
    queryKey: ["diet"],
    queryFn: async () => (await fetch("/api/diet")).json(),
  });

  const save = useMutation({
    mutationFn: async (next: DietTag[]) => {
      const res = await fetch("/api/diet", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diets: next }),
      });
      if (!res.ok) throw new Error();
      return (await res.json()) as DietTag[];
    },
    onSuccess: (saved) => {
      qc.setQueryData(["diet"], saved);
      qc.invalidateQueries({ queryKey: ["recipes"] }); // el selector se refiltra
      toast.success("Dieta actualizada");
    },
    onError: () => toast.error("No se pudo guardar."),
  });

  const current = diets.data ?? [];
  const toggle = (tag: DietTag) =>
    save.mutate(current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]);

  return (
    <section className="rounded-2xl border border-ink/5 bg-white p-4">
      <h2 className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-ink">
        <Salad className="h-4 w-4 text-herb" /> Tu dieta
      </h2>
      <p className="mb-3 text-xs text-ink/50">
        El plan y El Duelo del hogar respetan las restricciones de todos sus miembros.
      </p>

      {diets.isLoading ? (
        <div className="flex justify-center py-3 text-ink/40">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {DIET_TAGS.map((tag) => {
            const on = current.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggle(tag)}
                disabled={save.isPending}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition disabled:opacity-60 ${
                  on ? "border-herb bg-herb/10 text-herb" : "border-ink/10 text-ink/60 hover:border-ink/30"
                }`}
              >
                {on && <Check className="h-3.5 w-3.5" />}
                {DIET_LABEL[tag]}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
