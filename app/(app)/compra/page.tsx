import { getCurrentUser } from "@/lib/auth/session";
import { getShoppingList } from "@/lib/shopping";
import { ShoppingList } from "@/components/shopping-list";
import { redirect } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CompraPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const aisles = await getShoppingList(user.id);
  const isEmpty = aisles.every((a) => a.items.length === 0);

  return (
    <div className="py-4">
      <h1 className="text-2xl font-bold text-ink">Lista de la compra</h1>
      <p className="mb-4 text-sm text-ink/60">De las recetas de tu semana, por pasillos.</p>

      {isEmpty ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink/10 p-10 text-center text-ink/50">
          <ShoppingCart className="h-8 w-8 text-paprika" />
          <p className="text-sm">Tu lista está vacía.</p>
          <Link href="/semana" className="text-sm font-medium text-brand hover:underline">
            Asigna recetas a tu semana →
          </Link>
        </div>
      ) : (
        <ShoppingList aisles={aisles} />
      )}
    </div>
  );
}
