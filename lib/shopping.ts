import "server-only";
import { prisma } from "@/lib/db";
import { mondayOf } from "@/lib/plan";
import type { Unit } from "@prisma/client";

// Unidades que se cuentan por piezas → se redondea hacia arriba (no compras media cebolla).
const COUNT_UNITS: Unit[] = ["ud", "diente", "lata", "manojo"];

// Orden lógico de pasillos del súper.
const AISLE_ORDER = [
  "Verdura", "Fruta", "Carne", "Pescado", "Huevos y lácteos", "Pasta y arroz",
  "Legumbres", "Conservas", "Panadería", "Salsas", "Especias", "Caldos", "Bebidas", "Despensa",
];

function roundQty(q: number, unit: Unit): number {
  if (COUNT_UNITS.includes(unit)) return Math.ceil(q);
  return Math.round(q * 10) / 10;
}

type Line = { ingredientName: string; aisle: string; quantity: number; unit: Unit; sourceRecipeIds: string[] };

/**
 * Agrega los ingredientes de las recetas asignadas a la semana:
 * suma por (ingrediente, unidad), escala por tamaño del hogar y descarta staples/al gusto.
 */
async function computeLines(userId: string): Promise<Line[]> {
  const weekStartDate = mondayOf();
  const [plan, user] = await Promise.all([
    prisma.weekPlan.findUnique({
      where: { userId_weekStartDate: { userId, weekStartDate } },
      include: {
        slots: { include: { recipe: { include: { ingredients: { include: { ingredient: true } } } } } },
      },
    }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);

  const prefs = (user?.prefs ?? {}) as { householdSize?: number };
  const household = prefs.householdSize && prefs.householdSize > 0 ? prefs.householdSize : 2;

  const map = new Map<string, Line>();
  for (const slot of plan?.slots ?? []) {
    const recipe = slot.recipe;
    if (!recipe) continue;
    const factor = household / (recipe.servings || 1);
    for (const ri of recipe.ingredients) {
      if (ri.ingredient.isStaple || ri.unit === "al_gusto") continue;
      const key = `${ri.ingredient.name}|${ri.unit}`;
      const scaled = ri.quantity * factor;
      const existing = map.get(key);
      if (existing) {
        existing.quantity += scaled;
        if (!existing.sourceRecipeIds.includes(recipe.id)) existing.sourceRecipeIds.push(recipe.id);
      } else {
        map.set(key, {
          ingredientName: ri.ingredient.name,
          aisle: ri.ingredient.category,
          quantity: scaled,
          unit: ri.unit,
          sourceRecipeIds: [recipe.id],
        });
      }
    }
  }

  return [...map.values()].map((l) => ({ ...l, quantity: roundQty(l.quantity, l.unit) }));
}

export type ShoppingItemView = { id: string; ingredientName: string; quantity: number; unit: Unit; checked: boolean };
export type ShoppingAisle = { aisle: string; items: ShoppingItemView[] };

/**
 * Sincroniza la ShoppingList de la semana con las líneas calculadas (preservando los
 * "comprado" de los ítems que sobreviven) y la devuelve agrupada por pasillo.
 */
export async function getShoppingList(userId: string): Promise<ShoppingAisle[]> {
  const weekStartDate = mondayOf();
  const plan = await prisma.weekPlan.findUnique({ where: { userId_weekStartDate: { userId, weekStartDate } } });
  if (!plan) return [];

  const list = await prisma.shoppingList.upsert({
    where: { weekPlanId: plan.id },
    update: {},
    create: { weekPlanId: plan.id },
    include: { items: true },
  });

  const lines = await computeLines(userId);
  const existingByKey = new Map(list.items.map((i) => [`${i.ingredientName}|${i.unit}`, i]));
  const wantedKeys = new Set(lines.map((l) => `${l.ingredientName}|${l.unit}`));

  const ops = [];
  for (const l of lines) {
    const ex = existingByKey.get(`${l.ingredientName}|${l.unit}`);
    if (ex) {
      ops.push(
        prisma.shoppingItem.update({
          where: { id: ex.id },
          data: { quantity: l.quantity, aisle: l.aisle, sourceRecipeIds: l.sourceRecipeIds },
        }),
      );
    } else {
      ops.push(
        prisma.shoppingItem.create({
          data: {
            listId: list.id, ingredientName: l.ingredientName, quantity: l.quantity,
            unit: l.unit, aisle: l.aisle, sourceRecipeIds: l.sourceRecipeIds,
          },
        }),
      );
    }
  }
  for (const i of list.items) {
    if (!wantedKeys.has(`${i.ingredientName}|${i.unit}`)) ops.push(prisma.shoppingItem.delete({ where: { id: i.id } }));
  }
  if (ops.length) await prisma.$transaction(ops);

  const items = await prisma.shoppingItem.findMany({
    where: { listId: list.id },
    orderBy: [{ aisle: "asc" }, { ingredientName: "asc" }],
  });

  const byAisle = new Map<string, ShoppingItemView[]>();
  for (const it of items) {
    if (!byAisle.has(it.aisle)) byAisle.set(it.aisle, []);
    byAisle.get(it.aisle)!.push({
      id: it.id, ingredientName: it.ingredientName, quantity: it.quantity, unit: it.unit, checked: it.checked,
    });
  }

  return [...byAisle.entries()]
    .map(([aisle, items]) => ({ aisle, items }))
    .sort((a, b) => {
      const ia = AISLE_ORDER.indexOf(a.aisle), ib = AISLE_ORDER.indexOf(b.aisle);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
}

/** Marca/desmarca un ítem como comprado, verificando propiedad. */
export async function toggleShoppingItem(userId: string, itemId: string, checked: boolean) {
  const item = await prisma.shoppingItem.findUnique({
    where: { id: itemId },
    include: { list: { include: { weekPlan: { select: { userId: true } } } } },
  });
  if (!item || item.list.weekPlan.userId !== userId) return null;
  return prisma.shoppingItem.update({ where: { id: itemId }, data: { checked } });
}
