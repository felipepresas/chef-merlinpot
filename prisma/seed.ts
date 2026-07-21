import { PrismaClient, Unit, MealType, Difficulty, DietTag } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Dietas que cumple cada receta (curado). VEGANO: ninguna de las semilla.
const DIET_BY_SLUG: Record<string, DietTag[]> = {
  "espaguetis-bolonesa": [DietTag.SIN_LACTOSA],
  "fajitas-de-pollo": [DietTag.SIN_LACTOSA],
  "tortilla-de-patatas": [DietTag.VEGETARIANO, DietTag.SIN_GLUTEN, DietTag.SIN_LACTOSA],
  "ensalada-cesar-pollo": [],
  "lentejas-chorizo": [DietTag.SIN_GLUTEN, DietTag.SIN_LACTOSA],
  "crema-de-calabacin": [DietTag.VEGETARIANO, DietTag.SIN_GLUTEN],
  "pollo-al-horno-patatas": [DietTag.SIN_GLUTEN, DietTag.SIN_LACTOSA],
  "salmon-al-horno": [DietTag.SIN_GLUTEN, DietTag.SIN_LACTOSA],
};

// ─── Ingredientes (name único, con pasillo, unidad por defecto y flag despensa) ──
type IngredientSeed = { name: string; category: string; defaultUnit: Unit; isStaple?: boolean };
const ingredients: IngredientSeed[] = [
  { name: "Espaguetis", category: "Pasta y arroz", defaultUnit: Unit.g },
  { name: "Tomate triturado", category: "Conservas", defaultUnit: Unit.g },
  { name: "Ajo", category: "Verdura", defaultUnit: Unit.diente },
  { name: "Cebolla", category: "Verdura", defaultUnit: Unit.ud },
  { name: "Carne picada", category: "Carne", defaultUnit: Unit.g },
  { name: "Aceite de oliva", category: "Despensa", defaultUnit: Unit.al_gusto, isStaple: true },
  { name: "Sal", category: "Despensa", defaultUnit: Unit.al_gusto, isStaple: true },
  { name: "Pimienta negra", category: "Despensa", defaultUnit: Unit.al_gusto, isStaple: true },
  { name: "Tortillas de trigo", category: "Panadería", defaultUnit: Unit.ud },
  { name: "Pollo", category: "Carne", defaultUnit: Unit.g },
  { name: "Pimiento", category: "Verdura", defaultUnit: Unit.ud },
  { name: "Patata", category: "Verdura", defaultUnit: Unit.g },
  { name: "Huevo", category: "Huevos y lácteos", defaultUnit: Unit.ud },
  { name: "Lechuga romana", category: "Verdura", defaultUnit: Unit.ud },
  { name: "Pan", category: "Panadería", defaultUnit: Unit.g },
  { name: "Queso parmesano", category: "Huevos y lácteos", defaultUnit: Unit.g },
  { name: "Salsa César", category: "Salsas", defaultUnit: Unit.ml },
  { name: "Lentejas", category: "Legumbres", defaultUnit: Unit.g },
  { name: "Chorizo", category: "Carne", defaultUnit: Unit.g },
  { name: "Zanahoria", category: "Verdura", defaultUnit: Unit.ud },
  { name: "Pimentón", category: "Especias", defaultUnit: Unit.cc, isStaple: true },
  { name: "Laurel", category: "Especias", defaultUnit: Unit.ud, isStaple: true },
  { name: "Calabacín", category: "Verdura", defaultUnit: Unit.ud },
  { name: "Caldo de verduras", category: "Caldos", defaultUnit: Unit.ml },
  { name: "Quesito", category: "Huevos y lácteos", defaultUnit: Unit.ud },
  { name: "Limón", category: "Fruta", defaultUnit: Unit.ud },
  { name: "Vino blanco", category: "Bebidas", defaultUnit: Unit.ml },
  { name: "Romero", category: "Especias", defaultUnit: Unit.manojo },
  { name: "Salmón", category: "Pescado", defaultUnit: Unit.g },
];

// ─── Recetas ─────────────────────────────────────────────────────────────────
type RecipeSeed = {
  slug: string; title: string; description: string;
  mealType: MealType; servings: number; prepTimeMin: number; cookTimeMin: number;
  difficulty?: Difficulty; cuisine: string; youtubeVideoId: string;
  steps: { text: string; durationMin?: number }[];
  ingredients: { name: string; quantity: number; unit: Unit }[];
};

const recipes: RecipeSeed[] = [
  {
    slug: "espaguetis-bolonesa", title: "Espaguetis a la boloñesa",
    description: "El clásico reconfortante de siempre.",
    mealType: MealType.DINNER, servings: 2, prepTimeMin: 10, cookTimeMin: 25,
    cuisine: "Italiana", youtubeVideoId: "R7PXRMJk7XM",
    steps: [
      { text: "Cuece los espaguetis en agua con sal.", durationMin: 10 },
      { text: "Sofríe ajo y cebolla picados en aceite.", durationMin: 5 },
      { text: "Añade la carne picada y dórala.", durationMin: 5 },
      { text: "Incorpora el tomate triturado y deja reducir.", durationMin: 10 },
      { text: "Mezcla la salsa con la pasta y sirve." },
    ],
    ingredients: [
      { name: "Espaguetis", quantity: 200, unit: Unit.g },
      { name: "Tomate triturado", quantity: 400, unit: Unit.g },
      { name: "Carne picada", quantity: 250, unit: Unit.g },
      { name: "Ajo", quantity: 2, unit: Unit.diente },
      { name: "Cebolla", quantity: 1, unit: Unit.ud },
      { name: "Aceite de oliva", quantity: 1, unit: Unit.al_gusto },
      { name: "Sal", quantity: 1, unit: Unit.al_gusto },
    ],
  },
  {
    slug: "fajitas-de-pollo", title: "Fajitas de pollo",
    description: "Rápidas, coloridas y para mojarse las manos.",
    mealType: MealType.DINNER, servings: 2, prepTimeMin: 15, cookTimeMin: 15,
    cuisine: "Mexicana", youtubeVideoId: "5ImeUdyU02s",
    steps: [
      { text: "Corta el pollo y el pimiento en tiras." },
      { text: "Saltea el pollo hasta dorar.", durationMin: 8 },
      { text: "Añade cebolla y pimiento y saltea.", durationMin: 6 },
      { text: "Rellena las tortillas y sirve." },
    ],
    ingredients: [
      { name: "Pollo", quantity: 300, unit: Unit.g },
      { name: "Pimiento", quantity: 1, unit: Unit.ud },
      { name: "Cebolla", quantity: 1, unit: Unit.ud },
      { name: "Tortillas de trigo", quantity: 6, unit: Unit.ud },
      { name: "Aceite de oliva", quantity: 1, unit: Unit.al_gusto },
    ],
  },
  {
    slug: "tortilla-de-patatas", title: "Tortilla de patatas",
    description: "Jugosa por dentro, la reina de la cocina española.",
    mealType: MealType.DINNER, servings: 4, prepTimeMin: 15, cookTimeMin: 20,
    cuisine: "Española", youtubeVideoId: "pvlkYYdIBV0",
    steps: [
      { text: "Pela y corta las patatas y la cebolla en láminas finas." },
      { text: "Fríelas a fuego suave en aceite hasta que estén tiernas.", durationMin: 15 },
      { text: "Bate los huevos y mézclalos con la patata escurrida." },
      { text: "Cuaja la tortilla por ambos lados en la sartén.", durationMin: 6 },
    ],
    ingredients: [
      { name: "Patata", quantity: 600, unit: Unit.g },
      { name: "Huevo", quantity: 6, unit: Unit.ud },
      { name: "Cebolla", quantity: 1, unit: Unit.ud },
      { name: "Aceite de oliva", quantity: 1, unit: Unit.al_gusto },
      { name: "Sal", quantity: 1, unit: Unit.al_gusto },
    ],
  },
  {
    slug: "ensalada-cesar-pollo", title: "Ensalada César con pollo",
    description: "Crujiente, fresca y con pollo a la plancha.",
    mealType: MealType.LUNCH, servings: 2, prepTimeMin: 15, cookTimeMin: 10,
    cuisine: "Internacional", youtubeVideoId: "e44P399uw7Q",
    steps: [
      { text: "Haz el pollo a la plancha y córtalo en tiras.", durationMin: 8 },
      { text: "Tuesta el pan en dados para los picatostes.", durationMin: 4 },
      { text: "Trocea la lechuga y mézclala con la salsa César." },
      { text: "Añade el pollo, los picatostes y el parmesano." },
    ],
    ingredients: [
      { name: "Lechuga romana", quantity: 1, unit: Unit.ud },
      { name: "Pollo", quantity: 250, unit: Unit.g },
      { name: "Pan", quantity: 80, unit: Unit.g },
      { name: "Queso parmesano", quantity: 40, unit: Unit.g },
      { name: "Salsa César", quantity: 60, unit: Unit.ml },
      { name: "Aceite de oliva", quantity: 1, unit: Unit.al_gusto },
      { name: "Sal", quantity: 1, unit: Unit.al_gusto },
    ],
  },
  {
    slug: "lentejas-chorizo", title: "Lentejas estofadas con chorizo",
    description: "Cuchara de la abuela, a fuego lento.",
    mealType: MealType.LUNCH, servings: 4, prepTimeMin: 15, cookTimeMin: 45,
    difficulty: Difficulty.MEDIUM, cuisine: "Española", youtubeVideoId: "ACTfLIS8_4o",
    steps: [
      { text: "Sofríe cebolla, ajo y zanahoria picados.", durationMin: 8 },
      { text: "Añade el chorizo en rodajas y el pimentón." },
      { text: "Incorpora las lentejas, el laurel y cubre con agua." },
      { text: "Cuece a fuego lento hasta que estén tiernas.", durationMin: 40 },
    ],
    ingredients: [
      { name: "Lentejas", quantity: 400, unit: Unit.g },
      { name: "Chorizo", quantity: 150, unit: Unit.g },
      { name: "Zanahoria", quantity: 2, unit: Unit.ud },
      { name: "Cebolla", quantity: 1, unit: Unit.ud },
      { name: "Ajo", quantity: 2, unit: Unit.diente },
      { name: "Pimentón", quantity: 1, unit: Unit.cc },
      { name: "Laurel", quantity: 1, unit: Unit.ud },
      { name: "Aceite de oliva", quantity: 1, unit: Unit.al_gusto },
      { name: "Sal", quantity: 1, unit: Unit.al_gusto },
    ],
  },
  {
    slug: "crema-de-calabacin", title: "Crema de calabacín",
    description: "Suave, ligera y lista en 20 minutos.",
    mealType: MealType.LUNCH, servings: 4, prepTimeMin: 10, cookTimeMin: 20,
    cuisine: "Española", youtubeVideoId: "kH1IY5R_ChQ",
    steps: [
      { text: "Pocha la cebolla en aceite.", durationMin: 5 },
      { text: "Añade el calabacín y la patata en trozos." },
      { text: "Cubre con el caldo y cuece hasta que estén tiernos.", durationMin: 15 },
      { text: "Tritura con los quesitos hasta obtener una crema fina." },
    ],
    ingredients: [
      { name: "Calabacín", quantity: 3, unit: Unit.ud },
      { name: "Patata", quantity: 150, unit: Unit.g },
      { name: "Cebolla", quantity: 1, unit: Unit.ud },
      { name: "Caldo de verduras", quantity: 500, unit: Unit.ml },
      { name: "Quesito", quantity: 2, unit: Unit.ud },
      { name: "Aceite de oliva", quantity: 1, unit: Unit.al_gusto },
      { name: "Sal", quantity: 1, unit: Unit.al_gusto },
    ],
  },
  {
    slug: "pollo-al-horno-patatas", title: "Pollo al horno con patatas",
    description: "Tierno por dentro, dorado por fuera. Para toda la familia.",
    mealType: MealType.DINNER, servings: 4, prepTimeMin: 20, cookTimeMin: 60,
    difficulty: Difficulty.MEDIUM, cuisine: "Española", youtubeVideoId: "zi5TeQBLaCA",
    steps: [
      { text: "Trocea las patatas y la cebolla y colócalas en la bandeja." },
      { text: "Coloca el pollo encima con ajo, limón y romero." },
      { text: "Riega con aceite y vino blanco y salpimienta." },
      { text: "Hornea a 190 ºC regando de vez en cuando.", durationMin: 60 },
    ],
    ingredients: [
      { name: "Pollo", quantity: 1200, unit: Unit.g },
      { name: "Patata", quantity: 800, unit: Unit.g },
      { name: "Cebolla", quantity: 1, unit: Unit.ud },
      { name: "Ajo", quantity: 3, unit: Unit.diente },
      { name: "Limón", quantity: 1, unit: Unit.ud },
      { name: "Vino blanco", quantity: 100, unit: Unit.ml },
      { name: "Romero", quantity: 1, unit: Unit.manojo },
      { name: "Aceite de oliva", quantity: 1, unit: Unit.al_gusto },
      { name: "Sal", quantity: 1, unit: Unit.al_gusto },
    ],
  },
  {
    slug: "salmon-al-horno", title: "Salmón al horno con verduras",
    description: "Saludable, en una bandeja y en 20 minutos.",
    mealType: MealType.DINNER, servings: 2, prepTimeMin: 10, cookTimeMin: 20,
    cuisine: "Saludable", youtubeVideoId: "I62KNB6zUeU",
    steps: [
      { text: "Corta el calabacín, el pimiento y la cebolla en tiras." },
      { text: "Colócalos en la bandeja con aceite y sal." },
      { text: "Pon los lomos de salmón encima con rodajas de limón." },
      { text: "Hornea a 200 ºC hasta que el salmón esté hecho.", durationMin: 18 },
    ],
    ingredients: [
      { name: "Salmón", quantity: 400, unit: Unit.g },
      { name: "Calabacín", quantity: 1, unit: Unit.ud },
      { name: "Pimiento", quantity: 1, unit: Unit.ud },
      { name: "Cebolla", quantity: 1, unit: Unit.ud },
      { name: "Limón", quantity: 1, unit: Unit.ud },
      { name: "Aceite de oliva", quantity: 1, unit: Unit.al_gusto },
      { name: "Sal", quantity: 1, unit: Unit.al_gusto },
    ],
  },
];

async function main() {
  const ingId: Record<string, string> = {};
  for (const i of ingredients) {
    const rec = await prisma.ingredient.upsert({ where: { name: i.name }, update: i, create: i });
    ingId[i.name] = rec.id;
  }

  for (const r of recipes) {
    const create = r.ingredients.map((x) => ({ ingredientId: ingId[x.name], quantity: x.quantity, unit: x.unit }));
    const scalar = {
      title: r.title, description: r.description, mealType: r.mealType, servings: r.servings,
      prepTimeMin: r.prepTimeMin, cookTimeMin: r.cookTimeMin, difficulty: r.difficulty ?? Difficulty.EASY,
      cuisine: r.cuisine, youtubeVideoId: r.youtubeVideoId, steps: r.steps, isSeed: true,
      diets: DIET_BY_SLUG[r.slug] ?? [],
    };
    await prisma.recipe.upsert({
      where: { slug: r.slug },
      update: { ...scalar, ingredients: { deleteMany: {}, create } },
      create: { slug: r.slug, ...scalar, ingredients: { create } },
    });
  }

  console.log(`✅ Seed completado: ${recipes.length} recetas, ${ingredients.length} ingredientes.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
