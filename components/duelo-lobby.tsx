"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Users, Swords, ChevronRight, Loader2, Hourglass, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { DueloGame } from "@/components/duelo-game";
import type { FriendData } from "@/lib/friends";
import type { MealType } from "@prisma/client";

type DuelItem = { id: string; status: string; isHost: boolean; accepted: boolean; myTurn: boolean; opponents: string[] };

const MEALS: { value: MealType | "ALL"; label: string }[] = [
  { value: "ALL", label: "Cualquiera" },
  { value: "LUNCH", label: "Almuerzo" },
  { value: "DINNER", label: "Cena" },
];

export function DueloLobby() {
  const [mode, setMode] = useState<"solo" | "duo">("solo");

  return (
    <div className="py-4">
      <div className="mb-6 flex items-center gap-2 rounded-xl bg-ink/5 p-1">
        <button
          onClick={() => setMode("solo")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${mode === "solo" ? "bg-white text-ink shadow-sm" : "text-ink/50"}`}
        >
          Solo
        </button>
        <button
          onClick={() => setMode("duo")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${mode === "duo" ? "bg-white text-ink shadow-sm" : "text-ink/50"}`}
        >
          A dos
        </button>
      </div>

      {mode === "solo" ? <DueloGame /> : <DuoLobby />}
    </div>
  );
}

function DuoLobby() {
  const router = useRouter();
  const [meal, setMeal] = useState<MealType | "ALL">("ALL");
  const [creating, setCreating] = useState(false);

  const friends = useQuery<FriendData>({ queryKey: ["friends"], queryFn: async () => (await fetch("/api/friends")).json() });
  const duels = useQuery<DuelItem[]>({
    queryKey: ["duels"],
    queryFn: async () => (await fetch("/api/duelo")).json(),
    refetchInterval: 5000,
  });

  async function challenge(friendId: string) {
    setCreating(true);
    try {
      const res = await fetch("/api/duelo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId, mealType: meal === "ALL" ? null : meal }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error");
      router.push(`/duelo/${json.sessionId}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCreating(false);
    }
  }

  const active = duels.data ?? [];

  return (
    <div className="space-y-8">
      {/* partidas / invitaciones */}
      {active.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">Partidas</h2>
          <ul className="space-y-2">
            {active.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/duelo/${d.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-ink/5 bg-white p-4 transition hover:border-brand"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <Swords className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">vs {d.opponents.join(", ")}</p>
                    <p className="text-xs text-ink/50">
                      {d.status === "WAITING"
                        ? d.accepted
                          ? "Esperando a que acepte…"
                          : "¡Te retan! Toca para responder"
                        : d.myTurn
                          ? "Es tu turno"
                          : "Turno del rival…"}
                    </p>
                  </div>
                  {d.status === "WAITING" && d.accepted ? (
                    <Hourglass className="h-4 w-4 text-ink/30" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-ink/30" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* retar */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/40">Reta a un amigo</h2>

        <div className="mb-4 flex gap-2 rounded-xl bg-ink/5 p-1">
          {MEALS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMeal(m.value)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${meal === m.value ? "bg-white text-ink shadow-sm" : "text-ink/50"}`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {friends.isLoading && (
          <div className="flex justify-center py-6 text-ink/40">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        {friends.data && friends.data.friends.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-ink/10 p-8 text-center text-ink/50">
            <Users className="h-7 w-7 text-brand" />
            <p className="text-sm">Necesitas amigos para jugar a dos.</p>
            <Link href="/amigos" className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
              <UserPlus className="h-4 w-4" /> Añadir amigos
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {friends.data?.friends.map((f) => (
              <li key={f.friendshipId}>
                <button
                  onClick={() => challenge(f.userId)}
                  disabled={creating}
                  className="flex w-full items-center gap-3 rounded-2xl border border-ink/5 bg-white p-3 text-left transition hover:border-brand disabled:opacity-60"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 font-semibold text-brand">
                    {(f.name?.[0] ?? f.email[0]).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{f.name ?? f.email}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-brand">
                    <Swords className="h-4 w-4" /> Retar
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
