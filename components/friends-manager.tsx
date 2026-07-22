"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Check, X, Loader2, Users, Clock, Home } from "lucide-react";
import { toast } from "sonner";
import type { FriendData } from "@/lib/friends";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export function FriendsManager() {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");

  const data = useQuery<FriendData>({
    queryKey: ["friends"],
    queryFn: async () => (await fetch("/api/friends")).json(),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["friends"] });

  const add = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error");
      return json;
    },
    onSuccess: () => {
      toast.success("Solicitud enviada");
      setEmail("");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const respond = useMutation({
    mutationFn: async (vars: { id: string; action: "accept" | "reject" }) => {
      const res = await fetch(`/api/friends/${vars.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: vars.action }),
      });
      if (!res.ok) throw new Error();
    },
    onSuccess: (_d, vars) => {
      toast.success(vars.action === "accept" ? "¡Ahora sois amigos!" : "Solicitud rechazada");
      refresh();
    },
    onError: () => toast.error("No se pudo completar."),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/friends/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    },
    onSuccess: refresh,
    onError: () => toast.error("No se pudo eliminar."),
  });

  const shareHome = useMutation({
    mutationFn: async (friendId: string) => {
      const res = await fetch("/api/household", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error");
    },
    onSuccess: () => {
      toast.success("Invitación de hogar enviada");
      qc.invalidateQueries({ queryKey: ["household"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const d = data.data;

  return (
    <div className="space-y-8">
      {/* añadir */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (email.trim()) add.mutate(email.trim());
        }}
        className="flex gap-2"
      >
        <input
          type="email"
          required
          placeholder="email de tu amigo/a"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-ink/10 bg-card px-4 py-3 text-ink outline-none focus:border-brand"
        />
        <Button type="submit" loading={add.isPending} className="shrink-0">
          {!add.isPending && <UserPlus className="h-4 w-4" />}
          Añadir
        </Button>
      </form>

      {data.isLoading && (
        <div className="flex justify-center py-8 text-ink/40">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {/* solicitudes entrantes */}
      {d && d.incoming.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">Solicitudes</h2>
          <ul className="space-y-2">
            {d.incoming.map((r) => (
              <li key={r.friendshipId} className="flex items-center gap-3 rounded-2xl border border-ink/5 bg-card p-3">
                <Avatar name={r.name} email={r.email} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{r.name ?? r.email}</p>
                  {r.name && <p className="truncate text-xs text-ink/50">{r.email}</p>}
                </div>
                <button
                  onClick={() => respond.mutate({ id: r.friendshipId, action: "accept" })}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-herb/10 text-herb hover:bg-herb/20"
                  aria-label="Aceptar"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => respond.mutate({ id: r.friendshipId, action: "reject" })}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink/5 text-ink/50 hover:bg-ink/10"
                  aria-label="Rechazar"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* amigos */}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">
          Amigos {d && `(${d.friends.length})`}
        </h2>
        {d && d.friends.length === 0 ? (
          <EmptyState icon={Users}>
            Aún no tienes amigos. Añade a alguien por su email para jugar El Duelo juntos.
          </EmptyState>
        ) : (
          <ul className="space-y-2">
            {d?.friends.map((f) => (
              <li key={f.friendshipId} className="flex items-center gap-3 rounded-2xl border border-ink/5 bg-card p-3">
                <Avatar name={f.name} email={f.email} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{f.name ?? f.email}</p>
                  {f.name && <p className="truncate text-xs text-ink/50">{f.email}</p>}
                </div>
                <button
                  onClick={() => shareHome.mutate(f.userId)}
                  disabled={shareHome.isPending}
                  className="inline-flex items-center gap-1 rounded-lg bg-brand/10 px-2.5 py-1.5 text-xs font-medium text-brand hover:bg-brand/20 disabled:opacity-60"
                >
                  <Home className="h-3.5 w-3.5" /> Hogar
                </button>
                <button
                  onClick={() => remove.mutate(f.friendshipId)}
                  className="text-ink/30 hover:text-danger"
                  aria-label="Eliminar amigo"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* solicitudes salientes */}
      {d && d.outgoing.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">Pendientes de aceptar</h2>
          <ul className="space-y-2">
            {d.outgoing.map((r) => (
              <li key={r.friendshipId} className="flex items-center gap-3 rounded-2xl border border-ink/5 bg-card p-3 opacity-70">
                <Avatar name={r.name} email={r.email} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{r.name ?? r.email}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-ink/40">
                  <Clock className="h-3 w-3" /> enviada
                </span>
                <button onClick={() => remove.mutate(r.friendshipId)} className="text-ink/30 hover:text-danger" aria-label="Cancelar">
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
