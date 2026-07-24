# Arquitectura — Chef

## 1. Stack

| Capa | Tecnología |
|------|-----------|
| Framework | **Next.js 16** (App Router) · React 19 · TypeScript |
| UI | Tailwind CSS 4 · Radix UI · lucide-react · framer-motion · sonner |
| Datos cliente | TanStack Query · react-hook-form + zod |
| API | Route Handlers de Next.js (`app/api/**`) + server actions donde encaje |
| ORM / BD | **Prisma 7** + PostgreSQL |
| Auth | **Firebase Auth** (cliente) + Firebase Admin (verificación de token en el servidor) |
| PWA | Manifest + service worker (instalable + offline del plan y la lista) |
| Vídeo | Embed de YouTube (`youtube-nocookie`) por `videoId` — sin API para reproducir |
| Deploy | Vercel (web) · Neon/Supabase (Postgres) · Firebase (auth) |

**Principio rector:** la lógica de negocio vive en `lib/` y la API es **agnóstica del
cliente**. Así la web PWA y, más adelante, la **Alexa Skill** consumen exactamente lo mismo.

## 2. Estructura de carpetas

```
chef/
├─ app/
│  ├─ (marketing)/            # landing pública
│  ├─ (app)/                  # zona autenticada
│  │  ├─ semana/              # plan semanal (almuerzos + cenas)
│  │  ├─ recetas/[slug]/      # ficha de receta (ingredientes, pasos, vídeo)
│  │  ├─ compra/              # lista de la compra
│  │  └─ duelo/               # juego de descarte
│  └─ api/
│     ├─ plan/                # CRUD del plan semanal y sus huecos
│     ├─ recetas/             # catálogo y búsqueda
│     ├─ compra/              # generar / marcar lista de la compra
│     └─ duelo/               # candidatos para el juego
├─ components/                # UI reutilizable (design system)
├─ lib/
│  ├─ db/                     # cliente Prisma
│  ├─ auth/                   # verificación Firebase (server)
│  ├─ shopping/               # agregación de ingredientes -> lista
│  └─ duelo/                  # lógica del torneo por descarte
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts                 # catálogo semilla (~30-50 recetas)
├─ public/                    # manifest, iconos, service worker
└─ docs/
```

## 3. Modelo de datos (Prisma)

Entidades núcleo (refinadas tras la [auditoría](AUDIT.md)):

- **User** — `id`, `firebaseUid`, `email`, `name`, `prefs (Json — incl. householdSize)`,
  `diets (DietTag[])` (restricciones), `goal (Goal?)` (objetivo nutricional personal, opt-in)
- **Recipe** — `id`, `slug`, `title`, `description`, `mealType (LUNCH|DINNER|BOTH)`,
  `servings`, `prepTimeMin`, `cookTimeMin`, `difficulty`, `youtubeVideoId`, `imageUrl`,
  `steps (Json — array de { text, durationMin? })`, `cuisine`, `diets (DietTag[])`,
  `calories?` (kcal por ración), `proteinG?` (proteína g por ración), `isSeed`
- **Ingredient** — `id`, `name`, `category` (pasillo del súper), `defaultUnit (Unit)`,
  `isStaple` (despensa habitual → fuera de la compra por defecto)
- **RecipeIngredient** — join `recipeId` × `ingredientId` + `quantity`, `unit (Unit)`, `note`
- **WeekPlan** — `id`, `userId`, `weekStartDate` (lunes, locale es)
- **PlanSlot** — `id`, `weekPlanId`, `dayOfWeek`, `mealType (MealType)`, `recipeId?`
  · `@@unique(weekPlanId, dayOfWeek, mealType)`
- **ShoppingList** — `id`, `weekPlanId`  →  **ShoppingItem** — `ingredient`, `quantity`,
  `unit`, `aisle`, `checked`, `sourceRecipeIds` (trazabilidad para regenerar)
- **Favorite** — `userId` × `recipeId`

**Enums**
- `Unit` — `g, kg, ml, l, ud, cs, cc, diente, lata, manojo, al_gusto`
- `MealType` — `LUNCH, DINNER` (extensible: `BREAKFAST, SNACK`)
- `DietTag` — `VEGETARIANO, VEGANO, SIN_GLUTEN, SIN_LACTOSA` (restricciones)
- `Goal` — `PERDER_PESO, MANTENER, GANAR_MUSCULO` (objetivo nutricional personal)

**Lista de la compra:** se **genera** agregando los `RecipeIngredient` de todas las recetas
asignadas a los huecos de la semana, agregando por **`(ingrediente, unidad)`** (mismas
unidades se suman; distintas se listan aparte) y agrupando por `category` (pasillo). Los
ingredientes `isStaple` y los `al_gusto` no entran por defecto. El usuario marca lo comprado;
`sourceRecipeIds` permite regenerar al cambiar el plan sin perder los checks.

**Escalado:** las cantidades son por `Recipe.servings`; escalar a la casa =
`quantity × (User.prefs.householdSize / recipe.servings)`.

**Nutrición y objetivos (Fase B):** capa **opt-in** y coherente con la marca (nunca un
contador — ver [BRAND.md](BRAND.md)). `User.goal` es personal y nullable: `null` = sin
calorías (experiencia por defecto); `MANTENER` solo muestra kcal; `PERDER_PESO`/`GANAR_MUSCULO`
además **sesgan `fillWeek`** (`lib/nutrition.scoreRecipe`: cercanía a las kcal ideales por
comida —cena más ligera que comida— + bonus de proteína). El objetivo lo aplica **quien pulsa**
"Rellena mi semana". `Recipe.calories`/`proteinG` son **por ración**, curados en el seed.

**El Duelo:** el estado del torneo vive en el cliente (no se persiste); la API solo sirve
la lista de **candidatos** (filtrable por tipo de comida, tiempo, favoritos, etc.).

## 4. YouTube

Cada receta guarda un `youtubeVideoId`. El vídeo se reproduce con un iframe de
`youtube-nocookie.com` (no requiere API key ni cuota). La YouTube Data API solo haría falta
si en el futuro queremos **buscar** vídeos automáticamente — no para el MVP.

## 5. PWA

- `manifest.webmanifest` con iconos, nombre "Chef", color de tema (púrpura mago).
- Service worker que cachea el **plan de la semana** y la **lista de la compra** para uso
  offline en el súper / la cocina.
- Instalable en móvil ("Añadir a pantalla de inicio").

## 6. Alexa (Echo Show) — Fase 3

**Alexa Custom Skill** independiente (Node en Lambda) que:

- Consume el mismo `/api` que la web (cuenta enlazada vía account linking con Firebase).
- Usa **APL** para mostrar el plan, la receta y el vídeo en la pantalla del Echo Show.
- Casos por voz: *"¿qué toca cenar hoy?"*, leer pasos, *"añade X a la compra"*, jugar El Duelo.

Requisito de diseño **desde ya**: mantener la API limpia y sin acoplarla a la UI web.
