import { FriendsManager } from "@/components/friends-manager";

export const dynamic = "force-dynamic";

export default function AmigosPage() {
  return (
    <div className="py-4">
      <h1 className="text-2xl font-bold text-ink">Amigos</h1>
      <p className="mb-6 text-sm text-ink/60">Añade amigos para decidir la comida juntos en El Duelo.</p>
      <FriendsManager />
    </div>
  );
}
