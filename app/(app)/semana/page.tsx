import { getCurrentUser } from "@/lib/auth/session";
import { getOrCreateCurrentWeekPlan, DAYS_ES, MEALS, MEAL_LABEL, mondayOf } from "@/lib/plan";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SemanaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const plan = await getOrCreateCurrentWeekPlan(user.id);
  const monday = mondayOf();

  // slot[day][meal] -> recipe title | null
  const byKey = new Map(plan.slots.map((s) => [`${s.dayOfWeek}-${s.mealType}`, s.recipe]));

  return (
    <div>
      <div className="py-4">
        <h1 className="text-2xl font-bold text-ink">Tu semana</h1>
        <p className="text-sm text-ink/60">
          Del {monday.getUTCDate()}/{monday.getUTCMonth() + 1} · almuerzos y cenas
        </p>
      </div>

      <div className="space-y-3">
        {DAYS_ES.map((dayName, day) => (
          <div key={day} className="rounded-2xl border border-ink/5 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-ink">{dayName}</h2>
            <div className="grid grid-cols-2 gap-3">
              {MEALS.map((meal) => {
                const recipe = byKey.get(`${day}-${meal}`);
                return (
                  <div key={meal} className="rounded-xl bg-cream p-3">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink/40">
                      {MEAL_LABEL[meal]}
                    </p>
                    {recipe ? (
                      <p className="text-sm font-medium text-ink">{recipe.title}</p>
                    ) : (
                      <button className="flex items-center gap-1 text-sm text-brand">
                        <Plus className="h-4 w-4" /> Añadir
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
