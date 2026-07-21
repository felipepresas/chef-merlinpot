import { notFound } from "next/navigation";
import Link from "next/link";
import { getRecipeBySlug, type RecipeStep } from "@/lib/recipes";
import { RecipeVideo } from "@/components/recipe-video";
import { formatQuantity } from "@/lib/units";
import { ArrowLeft, Clock, Users, ChefHat } from "lucide-react";

export const dynamic = "force-dynamic";

const DIFFICULTY_LABEL: Record<string, string> = { EASY: "Fácil", MEDIUM: "Media", HARD: "Difícil" };

export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) notFound();

  const steps = (recipe.steps as unknown as RecipeStep[]) ?? [];
  const totalTime = (recipe.prepTimeMin ?? 0) + (recipe.cookTimeMin ?? 0);

  return (
    <div className="py-4">
      <Link href="/semana" className="mb-4 inline-flex items-center gap-1 text-sm text-ink/50 hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>

      <h1 className="text-2xl font-bold text-ink">{recipe.title}</h1>
      {recipe.description && <p className="mt-1 text-ink/60">{recipe.description}</p>}

      <div className="mt-3 flex flex-wrap gap-4 text-sm text-ink/60">
        {totalTime > 0 && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4 text-paprika" /> {totalTime} min
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Users className="h-4 w-4 text-paprika" /> {recipe.servings} pers.
        </span>
        <span className="inline-flex items-center gap-1">
          <ChefHat className="h-4 w-4 text-paprika" /> {DIFFICULTY_LABEL[recipe.difficulty]}
        </span>
      </div>

      {recipe.youtubeVideoId && (
        <div className="mt-6">
          <RecipeVideo videoId={recipe.youtubeVideoId} title={recipe.title} />
        </div>
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-ink">Ingredientes</h2>
        {recipe.ingredients.length === 0 ? (
          <p className="text-sm text-ink/50">Esta receta aún no tiene ingredientes.</p>
        ) : (
        <ul className="divide-y divide-ink/5 rounded-2xl border border-ink/5 bg-white">
          {recipe.ingredients.map((ri) => (
            <li key={ri.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-ink">{ri.ingredient.name}</span>
              <span className="text-ink/50">{formatQuantity(ri.quantity, ri.unit)}</span>
            </li>
          ))}
        </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-ink">Preparación</h2>
        {steps.length === 0 ? (
          <p className="text-sm text-ink/50">Los pasos de esta receta llegarán pronto.</p>
        ) : (
        <ol className="space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3 rounded-2xl border border-ink/5 bg-white p-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
                {i + 1}
              </span>
              <div className="text-sm text-ink">
                <p>{step.text}</p>
                {step.durationMin != null && (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs text-ink/40">
                    <Clock className="h-3 w-3" /> {step.durationMin} min
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
        )}
      </section>
    </div>
  );
}
