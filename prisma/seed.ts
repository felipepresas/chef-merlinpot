import { PrismaClient, Unit } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Ingredientes base (con pasillo y despensa). Ampliar con el catálogo completo.
const ingredients = [
  { name: "Espaguetis", category: "Pasta y arroz", defaultUnit: Unit.g },
  { name: "Tomate triturado", category: "Conservas", defaultUnit: Unit.g },
  { name: "Ajo", category: "Verdura", defaultUnit: Unit.diente },
  { name: "Cebolla", category: "Verdura", defaultUnit: Unit.ud },
  { name: "Carne picada", category: "Carne", defaultUnit: Unit.g },
  { name: "Aceite de oliva", category: "Despensa", defaultUnit: Unit.al_gusto, isStaple: true },
  { name: "Sal", category: "Despensa", defaultUnit: Unit.al_gusto, isStaple: true },
  { name: "Tortillas de trigo", category: "Panadería", defaultUnit: Unit.ud },
  { name: "Pollo", category: "Carne", defaultUnit: Unit.g },
  { name: "Pimiento", category: "Verdura", defaultUnit: Unit.ud },
];

async function main() {
  const ing: Record<string, string> = {};
  for (const i of ingredients) {
    const rec = await prisma.ingredient.upsert({
      where: { name: i.name },
      update: i,
      create: i,
    });
    ing[i.name] = rec.id;
  }

  // Receta 1 — Espaguetis a la boloñesa
  await prisma.recipe.upsert({
    where: { slug: "espaguetis-bolonesa" },
    update: {},
    create: {
      slug: "espaguetis-bolonesa",
      title: "Espaguetis a la boloñesa",
      description: "El clásico reconfortante de siempre.",
      mealType: "DINNER",
      servings: 2,
      prepTimeMin: 10,
      cookTimeMin: 25,
      cuisine: "Italiana",
      isSeed: true,
      steps: [
        { text: "Cuece los espaguetis en agua con sal.", durationMin: 10 },
        { text: "Sofríe ajo y cebolla en aceite.", durationMin: 5 },
        { text: "Añade la carne y dórala.", durationMin: 5 },
        { text: "Incorpora el tomate y deja reducir.", durationMin: 10 },
        { text: "Mezcla con la pasta y sirve." },
      ],
      ingredients: {
        create: [
          { ingredientId: ing["Espaguetis"], quantity: 200, unit: Unit.g },
          { ingredientId: ing["Tomate triturado"], quantity: 400, unit: Unit.g },
          { ingredientId: ing["Carne picada"], quantity: 250, unit: Unit.g },
          { ingredientId: ing["Ajo"], quantity: 2, unit: Unit.diente },
          { ingredientId: ing["Cebolla"], quantity: 1, unit: Unit.ud },
          { ingredientId: ing["Aceite de oliva"], quantity: 1, unit: Unit.al_gusto },
          { ingredientId: ing["Sal"], quantity: 1, unit: Unit.al_gusto },
        ],
      },
    },
  });

  // Receta 2 — Fajitas de pollo
  await prisma.recipe.upsert({
    where: { slug: "fajitas-de-pollo" },
    update: {},
    create: {
      slug: "fajitas-de-pollo",
      title: "Fajitas de pollo",
      description: "Rápidas, coloridas y para mojarse las manos.",
      mealType: "DINNER",
      servings: 2,
      prepTimeMin: 15,
      cookTimeMin: 15,
      cuisine: "Mexicana",
      isSeed: true,
      steps: [
        { text: "Corta el pollo y el pimiento en tiras." },
        { text: "Saltea el pollo hasta dorar.", durationMin: 8 },
        { text: "Añade cebolla y pimiento.", durationMin: 6 },
        { text: "Rellena las tortillas y sirve." },
      ],
      ingredients: {
        create: [
          { ingredientId: ing["Pollo"], quantity: 300, unit: Unit.g },
          { ingredientId: ing["Pimiento"], quantity: 1, unit: Unit.ud },
          { ingredientId: ing["Cebolla"], quantity: 1, unit: Unit.ud },
          { ingredientId: ing["Tortillas de trigo"], quantity: 6, unit: Unit.ud },
          { ingredientId: ing["Aceite de oliva"], quantity: 1, unit: Unit.al_gusto },
        ],
      },
    },
  });

  console.log("✅ Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
