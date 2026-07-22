import type { ReactNode } from "react";

type Tone = "brand" | "paprika" | "herb" | "neutral";

const TONES: Record<Tone, string> = {
  brand: "bg-brand/10 text-brand",
  paprika: "bg-paprika/10 text-paprika",
  herb: "bg-herb/10 text-herb",
  neutral: "bg-ink/5 text-ink/60",
};

/** Píldora de estado/etiqueta con el tono de marca. */
export function Badge({
  tone = "brand",
  className = "",
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
