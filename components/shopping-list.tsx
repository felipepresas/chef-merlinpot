"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { formatQuantity } from "@/lib/units";
import type { ShoppingAisle } from "@/lib/shopping";

export function ShoppingList({ aisles }: { aisles: ShoppingAisle[] }) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(
    () => new Set(aisles.flatMap((a) => a.items).filter((i) => i.checked).map((i) => i.id)),
  );

  const toggle = useMutation({
    mutationFn: async (vars: { itemId: string; checked: boolean }) => {
      const res = await fetch("/api/compra/item", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vars),
      });
      if (!res.ok) throw new Error();
    },
    onError: (_e, vars) => {
      // revertir en caso de error
      setCheckedIds((prev) => {
        const next = new Set(prev);
        if (vars.checked) next.delete(vars.itemId);
        else next.add(vars.itemId);
        return next;
      });
      toast.error("No se pudo guardar el cambio.");
    },
  });

  function onToggle(itemId: string) {
    const willCheck = !checkedIds.has(itemId);
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (willCheck) next.add(itemId);
      else next.delete(itemId);
      return next;
    });
    toggle.mutate({ itemId, checked: willCheck });
  }

  const allItems = aisles.flatMap((a) => a.items);
  const total = allItems.length;
  const done = allItems.filter((i) => checkedIds.has(i.id)).length;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between text-sm text-ink/60">
        <span>{total} artículos</span>
        <span>
          {done}/{total} comprados
        </span>
      </div>

      <div className="space-y-5">
        {aisles.map((aisle) => (
          <section key={aisle.aisle}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">
              {aisle.aisle}
            </h2>
            <ul className="divide-y divide-ink/5 overflow-hidden rounded-2xl border border-ink/5 bg-white">
              {aisle.items.map((item) => {
                const checked = checkedIds.has(item.id);
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onToggle(item.id)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left"
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                          checked ? "border-herb bg-herb text-white" : "border-ink/20"
                        }`}
                      >
                        {checked && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <span className={`flex-1 text-sm ${checked ? "text-ink/40 line-through" : "text-ink"}`}>
                        {item.ingredientName}
                      </span>
                      <span className={`text-sm ${checked ? "text-ink/30" : "text-ink/50"}`}>
                        {formatQuantity(item.quantity, item.unit)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
