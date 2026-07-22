"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Home, Check, X, Loader2, LogOut, Clock } from "lucide-react";
import { toast } from "sonner";
import type { HouseholdData } from "@/lib/household";
import { Avatar } from "@/components/ui/avatar";

export function HouseholdSection() {
  const qc = useQueryClient();
  const router = useRouter();
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["household"] });
    router.refresh(); // el plan/compra cambian al unirse o salir
  };

  const data = useQuery<HouseholdData>({
    queryKey: ["household"],
    queryFn: async () => (await fetch("/api/household")).json(),
  });

  const respond = useMutation({
    mutationFn: async (vars: { id: string; action: "accept" | "decline" }) => {
      const res = await fetch(`/api/household/invite/${vars.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: vars.action }),
      });
      if (!res.ok) throw new Error();
    },
    onSuccess: (_d, vars) => {
      toast.success(vars.action === "accept" ? "¡Ahora compartís hogar!" : "Invitación rechazada");
      refresh();
    },
    onError: () => toast.error("No se pudo completar."),
  });

  const cancel = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/household/invite/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    },
    onSuccess: refresh,
  });

  const leave = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/household/leave", { method: "POST" });
      if (!res.ok) throw new Error();
    },
    onSuccess: () => {
      toast.success("Has salido del hogar");
      refresh();
    },
  });

  const d = data.data;
  const shared = (d?.members.length ?? 0) > 1;

  return (
    <section className="space-y-4">
      {/* invitaciones de hogar entrantes */}
      {d?.incoming.map((inv) => (
        <div key={inv.inviteId} className="flex items-center gap-3 rounded-2xl border border-brand/30 bg-brand/5 p-4">
          <Home className="h-5 w-5 shrink-0 text-brand" />
          <p className="min-w-0 flex-1 text-sm text-ink">
            <b>{inv.from}</b> te invita a compartir su hogar (plan y compra).
          </p>
          <button
            onClick={() => respond.mutate({ id: inv.inviteId, action: "accept" })}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-herb/10 text-herb hover:bg-herb/20"
            aria-label="Aceptar"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={() => respond.mutate({ id: inv.inviteId, action: "decline" })}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink/5 text-ink/50 hover:bg-ink/10"
            aria-label="Rechazar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}

      {/* tu hogar */}
      <div className="rounded-2xl border border-ink/5 bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
            <Home className="h-4 w-4 text-brand" /> Tu hogar
          </h2>
          {shared && (
            <button
              onClick={() => leave.mutate()}
              disabled={leave.isPending}
              className="inline-flex items-center gap-1 text-xs text-ink/50 hover:text-danger"
            >
              <LogOut className="h-3.5 w-3.5" /> Salir
            </button>
          )}
        </div>

        {data.isLoading ? (
          <div className="flex justify-center py-4 text-ink/40">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {d?.members.map((m) => (
                <span key={m.userId} className="inline-flex items-center gap-2 rounded-full bg-cream py-1 pl-1 pr-3">
                  <Avatar name={m.name} email={m.email} size="sm" />
                  <span className="text-sm text-ink">{m.isMe ? "Tú" : (m.name ?? m.email)}</span>
                </span>
              ))}
            </div>
            {!shared && (
              <p className="mt-3 text-xs text-ink/50">
                Solo tú. Invita a quien vive contigo (desde tus amigos) para compartir el plan y la lista de la compra.
              </p>
            )}
            {d?.outgoing.map((o) => (
              <p key={o.inviteId} className="mt-2 inline-flex items-center gap-1 text-xs text-ink/40">
                <Clock className="h-3 w-3" /> Invitación a {o.to} pendiente
                <button onClick={() => cancel.mutate(o.inviteId)} className="ml-1 text-ink/30 hover:text-danger">
                  <X className="h-3 w-3" />
                </button>
              </p>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
