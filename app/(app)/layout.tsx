import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { LogoutButton } from "@/components/logout-button";
import { AppNav } from "@/components/app-nav";
import { Sparkles } from "lucide-react";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/semana" className="inline-flex items-center gap-2 font-bold text-ink">
          <Sparkles className="h-5 w-5 text-brand" /> Chef
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-ink/50 sm:inline">{user.name ?? user.email}</span>
          <LogoutButton />
        </div>
      </header>

      <main className="flex-1 px-6 pb-24">{children}</main>

      <AppNav />
    </div>
  );
}
