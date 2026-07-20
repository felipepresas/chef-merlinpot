# CLAUDE.md — Chef by merlinpot

Guía para trabajar en este repositorio. Léela antes de tocar código.

## Qué es Chef

**Chef** (chef.merlinpot.com) es un **planificador mágico de comidas de la semana**:
organiza almuerzos y cenas, muestra receta + ingredientes + vídeo de YouTube, genera la
lista de la compra semanal y ofrece **"El Duelo"** (juego de descarte) para decidir cuando
no sabes qué comer. Lo desarrolla el estudio **merlinpot**.

- Marca y tono: ver [docs/BRAND.md](docs/BRAND.md).
- Arquitectura y modelo de datos: ver [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
- Alcance por fases: ver [docs/ROADMAP.md](docs/ROADMAP.md).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · Radix UI · lucide-react ·
framer-motion · sonner · TanStack Query · react-hook-form + zod · Prisma 7 + PostgreSQL ·
Firebase Auth · PWA. Convenciones alineadas con el resto de la casa (merlinwolf).

## Principios de arquitectura (no negociables)

1. **La lógica de negocio vive en `lib/`, no en componentes ni en route handlers.**
   Los handlers de `app/api/**` solo validan (zod), llaman a `lib/` y serializan.
2. **La API es agnóstica del cliente.** La web PWA y la futura Alexa Skill (Fase 3)
   consumen la misma API. No metas lógica de presentación web en la API.
3. **Validación en el borde con zod.** Toda entrada externa (body, params, query) se valida.
4. **Firebase es la fuente de identidad; Postgres es la fuente de datos.**
   El `User` de Prisma se enlaza por `firebaseUid`; el token se verifica en el servidor.

## Estructura

```
app/(marketing)/   landing pública
app/(app)/         zona autenticada: semana, recetas/[slug], compra, duelo
app/api/           plan, recetas, compra, duelo
components/        design system + UI reutilizable
lib/               db, auth, shopping (agregación), duelo (torneo)
prisma/            schema.prisma + seed.ts (catálogo semilla)
```

## Convenciones de código

- **TypeScript estricto.** Sin `any` salvo justificación. Tipos de dominio en `lib/types`.
- **Server Components por defecto**; `"use client"` solo donde haya interacción/estado.
- **Datos en cliente con TanStack Query**; formularios con react-hook-form + zod.
- **Estilos con Tailwind** usando los tokens de marca (no hardcodear hex sueltos).
- **Iconos con `lucide-react`.** Toasts con `sonner`.
- **Nombres de dominio en español** de cara al usuario; **código en inglés**.
- Imports absolutos con alias `@/`.

## Marca en código

Tokens (definir escala completa en el design system):

| Token | Hex | Uso |
|-------|-----|-----|
| `brand` (púrpura mago) | `#6D28D9` | Marca, acción principal, magia |
| `paprika` (acento) | `#EA580C` | Comida/apetito, CTA secundario |
| `cream` (fondo) | `#FAF7F2` | Lienzo |
| `ink` (texto) | `#1C1917` | Texto |
| `herb` (éxito) | `#16A34A` | Confirmaciones, "comprado" |

## Reglas de dominio a respetar

- **Lista de la compra:** se genera agregando los ingredientes de las recetas asignadas a la
  semana, sumando por ingrediente + unidad y agrupando por pasillo (`Ingredient.category`).
  Los ingredientes marcados como **staple/despensa** (sal, aceite…) y los "al gusto" no
  entran por defecto. Ver [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
- **Escalado de porciones:** las cantidades de `RecipeIngredient` son por `Recipe.servings`.
  Escalar = `cantidad × (objetivo / recipe.servings)`. No romper esta relación.
- **Pasos de receta estructurados** (`{ text, durationMin? }`) para poder leerlos por voz en
  Alexa. No guardar los pasos como un bloque de texto plano.
- **El Duelo:** el estado del torneo es de cliente; la API solo sirve candidatos filtrables.

## Comandos

```bash
npm run dev            # desarrollo
npm run build          # build de producción
npm run lint           # eslint
npm run typecheck      # tsc --noEmit
npx prisma migrate dev # migración + cliente
npx prisma db seed     # catálogo semilla
```

## Notas de despliegue

- Vercel (web) + Postgres gestionado (Neon/Supabase) + Firebase (auth).
- **Prisma en serverless necesita conexión pooled** (pgbouncer / Neon pooling /
  `@prisma/adapter-pg`). No usar conexión directa sin pool en producción.
- Secretos en `.env.local` (nunca commitear). Mantener `.env.example` al día.

## Antes de dar algo por hecho

- No inventes recetas/ingredientes en producción sin marcar `isSeed`.
- Embeder YouTube vía `youtube-nocookie` (no descargar vídeo — respeta los ToS).
- Si tocas el modelo de datos, actualiza `docs/ARCHITECTURE.md` en el mismo cambio.
