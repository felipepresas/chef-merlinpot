import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { LogoutButton } from "@/components/logout-button";
import { CalendarDays, ShoppingCart, Swords, Sparkles, Users } from "lucide-react";

const NAV = [
  { href: "/semana", label: "Semana", icon: CalendarDays },
  { href: "/compra", label: "Compra", icon: ShoppingCart },
  { href: "/duelo", label: "El Duelo", icon: Swords },
  { href: "/amigos", label: "Amigos", icon: Users },
];

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

      <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-2xl items-center justify-around border-t border-ink/5 bg-cream/90 px-6 py-3 backdrop-blur">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 text-xs text-ink/60 hover:text-brand"
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
