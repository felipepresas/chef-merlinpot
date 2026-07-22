import { getCurrentUser } from "@/lib/auth/session";
import { getShoppingList } from "@/lib/shopping";
import { ShoppingList } from "@/components/shopping-list";
import { EmptyState } from "@/components/ui/empty-state";
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
      <h1 className="font-display text-2xl font-semibold text-ink">Lista de la compra</h1>
      <p className="mb-4 text-sm text-ink/60">De las recetas de tu semana, por pasillos.</p>

      {isEmpty ? (
        <div className="mt-8">
          <EmptyState icon={ShoppingCart} iconClassName="text-paprika" title="Tu lista está vacía.">
            <Link href="/semana" className="font-medium text-brand hover:underline">
              Asigna recetas a tu semana →
            </Link>
          </EmptyState>
        </div>
      ) : (
        <ShoppingList aisles={aisles} />
      )}
    </div>
  );
}
