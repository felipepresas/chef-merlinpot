# Roadmap — Chef

## Fase 1 — MVP

Objetivo: resolver el bucle completo *planificar → cocinar → comprar → decidir*.

- [ ] **Auth** — registro/login con Firebase, sesión y protección de rutas.
- [ ] **Plan semanal** — vista de la semana con almuerzo y cena por día.
- [ ] **Asignar receta** — elegir del catálogo semilla y colocarla en un hueco.
- [ ] **Ficha de receta** — ingredientes, pasos y vídeo de YouTube embebido.
- [ ] **Lista de la compra** — generada de la semana, agrupada por pasillo, con check.
- [ ] **El Duelo** — juego de descarte para elegir cuando estás indeciso.
- [ ] **PWA** — instalable + offline del plan y la lista.
- [ ] **Catálogo semilla** — ~30-50 recetas con ingredientes y vídeo.

## Fase 2 — Crecer

- [ ] Favoritos y filtros (tipo de comida, tiempo, dieta, cocina).
- [ ] Porciones ajustables (escalar ingredientes automáticamente).
- [ ] "Rellena mi semana" — sugerencia automática del plan.
- [ ] Compartir plan / lista de la compra.
- [ ] Historial: qué comimos, evitar repetir.

## Fase 3 — Nuevas superficies

- [ ] **Alexa Skill (Echo Show)** — plan, receta y vídeo por voz + APL.
- [ ] Recetas creadas por el usuario.
- [ ] Notificaciones ("hoy toca cocinar X").

## Primeros pasos técnicos (arranque)

1. Scaffold de Next.js 16 + TypeScript + Tailwind en `chef/`.
2. `git init` + repositorio.
3. Config base: ESLint/Prettier, alias de imports, variables de entorno.
4. Prisma + esquema inicial + conexión a Postgres.
5. Firebase Auth (login básico) y protección de rutas.
6. Design system mínimo (colores de marca, tipografía, componentes base).
7. Catálogo semilla + primera pantalla del plan semanal.
