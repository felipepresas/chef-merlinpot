import { ShoppingCart } from "lucide-react";

export default function CompraPage() {
  return (
    <div className="py-4">
      <h1 className="text-2xl font-bold text-ink">Lista de la compra</h1>
      <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink/10 p-10 text-center text-ink/50">
        <ShoppingCart className="h-8 w-8 text-paprika" />
        <p className="text-sm">Aquí aparecerá la compra de tu semana, agrupada por pasillos.</p>
        <p className="text-xs">Próximamente.</p>
      </div>
    </div>
  );
}
