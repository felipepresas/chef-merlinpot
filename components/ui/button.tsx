import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-800 shadow-sm",
  secondary: "border border-ink/10 bg-card text-ink hover:border-brand",
  ghost: "text-ink/60 hover:text-brand",
  danger: "bg-danger text-white hover:bg-danger/90 shadow-sm",
};

const SIZES: Record<Size, string> = {
  sm: "gap-1.5 px-3 py-2 text-sm",
  md: "gap-2 px-5 py-3 text-sm",
  lg: "gap-2 px-7 py-3.5",
};

/** Clases del botón de marca. Úsalo en `<Link>` (que no puede ser <Button>). */
export function buttonClass(opts: {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  const { variant = "primary", size = "md", fullWidth = false, className = "" } = opts;
  return [
    "inline-flex items-center justify-center rounded-xl font-semibold transition",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
    "disabled:cursor-not-allowed disabled:opacity-60",
    VARIANTS[variant],
    SIZES[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  children: ReactNode;
};

export function Button({
  variant,
  size,
  fullWidth,
  loading = false,
  disabled,
  className,
  children,
  ...rest
}: Props) {
  return (
    <button
      className={buttonClass({ variant, size, fullWidth, className })}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
