"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    toast.success("Sesión cerrada");
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      aria-label="Cerrar sesión"
      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-ink/50 transition hover:bg-ink/5 hover:text-ink"
    >
      <LogOut className="h-4 w-4" /> Salir
    </button>
  );
}
