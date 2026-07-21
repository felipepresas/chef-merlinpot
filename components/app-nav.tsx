"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ShoppingCart, Swords, Users, type LucideIcon } from "lucide-react";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/semana", label: "Semana", icon: CalendarDays },
  { href: "/compra", label: "Compra", icon: ShoppingCart },
  { href: "/duelo", label: "El Duelo", icon: Swords },
  { href: "/amigos", label: "Amigos", icon: Users },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-2xl items-center justify-around border-t border-ink/5 bg-cream/90 px-6 py-3 backdrop-blur">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-1 text-xs transition-colors ${
              active ? "font-semibold text-brand" : "text-ink/60 hover:text-brand"
            }`}
          >
            <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
