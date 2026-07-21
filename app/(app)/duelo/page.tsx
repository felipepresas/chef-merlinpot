import { Swords } from "lucide-react";

export default function DueloPage() {
  return (
    <div className="py-4">
      <h1 className="text-2xl font-bold text-ink">El Duelo</h1>
      <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink/10 p-10 text-center text-ink/50">
        <Swords className="h-8 w-8 text-brand" />
        <p className="text-sm">¿Indeciso? Enfrenta dos platos y deja que el mago elija por ti.</p>
        <p className="text-xs">Próximamente.</p>
      </div>
    </div>
  );
}
