# Chef — by merlinpot

**Chef** es el planificador mágico de comidas de la semana: organiza almuerzos y cenas,
enseña la receta, los ingredientes y el vídeo, genera la lista de la compra y, cuando no
sabes qué comer, deja que **el mago elija por ti**.

- **Producto:** Chef · https://chef.merlinpot.com
- **Estudio:** merlinpot
- **Estado:** planificación / arranque (greenfield)

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [docs/BRAND.md](docs/BRAND.md) | Identidad de marca: concepto, nombre, tono, colores, tipografía, el juego "El Duelo". |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Stack, estructura de carpetas, modelo de datos, API, PWA, Alexa. |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Alcance del MVP y fases posteriores. |

## Decisiones de arranque

| Tema | Decisión |
|------|----------|
| Arquitectura | **Next.js full-stack** (UI + API + Prisma/Postgres en una app) |
| Plataforma | **PWA mobile-first** (+ Echo Show vía Alexa Skill en Fase 3) |
| Recetas | **Catálogo propio semilla** (~30-50 recetas) |
| Cuentas | **Login desde el inicio** (Firebase Auth) |

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind 4 · Radix UI · TanStack Query ·
react-hook-form + zod · Prisma 7 + Postgres · Firebase Auth · PWA.

Convenciones alineadas con el resto de la casa (merlinwolf).
