import { getCurrentUser } from "@/lib/auth/session";
import { getOrCreateCurrentWeekPlan, mondayOf } from "@/lib/plan";
import { getUserGoal } from "@/lib/goal";
import { WeekGrid } from "@/components/week-grid";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SemanaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [plan, goal] = await Promise.all([
    getOrCreateCurrentWeekPlan(user.id),
    getUserGoal(user.id),
  ]);
  const monday = mondayOf();

  const slots = plan.slots
    .slice()
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
    .map((s) => ({
      slotId: s.id,
      dayOfWeek: s.dayOfWeek,
      mealType: s.mealType,
      recipe: s.recipe
        ? {
            id: s.recipe.id,
            title: s.recipe.title,
            slug: s.recipe.slug,
            calories: s.recipe.calories,
            proteinG: s.recipe.proteinG,
          }
        : null,
    }));

  return (
    <div>
      <div className="py-4">
        <h1 className="font-display text-2xl font-semibold text-ink">Tu semana</h1>
        <p className="text-sm text-ink/60">
          Del {monday.getUTCDate()}/{monday.getUTCMonth() + 1} · almuerzos y cenas
        </p>
      </div>
      <WeekGrid initialSlots={slots} showCalories={goal !== null} />
    </div>
  );
}
