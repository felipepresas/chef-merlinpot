import type { LucideIcon } from "lucide-react";

/** Estado vacío estándar: recuadro punteado con icono, título opcional y contenido. */
export function EmptyState({
  icon: Icon,
  title,
  iconClassName = "text-brand",
  children,
}: {
  icon: LucideIcon;
  title?: string;
  iconClassName?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink/10 p-10 text-center text-ink/50">
      <Icon className={`h-8 w-8 ${iconClassName}`} />
      {title && <p className="text-sm font-medium text-ink">{title}</p>}
      {children && <div className="text-sm">{children}</div>}
    </div>
  );
}
