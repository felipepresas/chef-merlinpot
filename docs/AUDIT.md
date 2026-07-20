# Auditoría de las bases — Chef

Revisión crítica del plan inicial antes de escribir código. Cada punto indica el riesgo y la
decisión tomada. Los cambios de modelo ya están reflejados en [ARCHITECTURE.md](ARCHITECTURE.md).

## 🔴 Críticos (afectan al modelo de datos)

### 1. Agregación de la lista de la compra entre unidades distintas
**Riesgo:** dos recetas piden el mismo ingrediente en unidades distintas ("200 g de tomate"
vs "1 lata de tomate"). Sumar a ciegas produce basura.
**Decisión:** agregar por `(ingrediente, unidad)`. Mismas unidades → se suman; unidades
distintas del mismo ingrediente → se listan como líneas separadas. Unidades como enum
controlado (`g, kg, ml, l, ud, cs, cc, diente, lata, manojo, al_gusto`).

### 2. Ingredientes de despensa / "al gusto"
**Riesgo:** meter sal, aceite, pimienta y agua en cada lista de la compra la vuelve inútil.
**Decisión:** `Ingredient.isStaple` (despensa habitual) y unidad `al_gusto`. Por defecto no
entran en la lista; el usuario puede activarlos.

### 3. Pasos como texto plano
**Riesgo:** un bloque de texto no se puede leer paso a paso por voz (Alexa) ni marcar progreso.
**Decisión:** `Recipe.steps` = array estructurado `{ text, durationMin? }`. Habilita
lectura por voz, temporizadores y checklist de cocina.

### 4. Escalado de porciones desde el modelo
**Riesgo:** si las cantidades no son relativas a las porciones de la receta, no se puede
escalar a la casa del usuario (Fase 2) sin migrar datos.
**Decisión:** `RecipeIngredient.quantity` siempre por `Recipe.servings`. `User.prefs`
guarda `householdSize`. Escalar = `quantity × (householdSize / recipe.servings)`.

### 5. Integridad del plan semanal
**Riesgo:** duplicar comida en el mismo hueco (mismo día + tipo).
**Decisión:** `@@unique(weekPlanId, dayOfWeek, mealType)` en `PlanSlot`. `mealType` como
enum extensible (hoy `LUNCH|DINNER`, mañana quizá `BREAKFAST|SNACK`).

## 🟡 Importantes (arquitectura / operación)

### 6. Prisma en serverless
**Riesgo:** agotar conexiones a Postgres en Vercel (cada invocación abre una).
**Decisión:** conexión **pooled** (Neon pooling / pgbouncer / `@prisma/adapter-pg`).
Documentado en CLAUDE.md.

### 7. Sincronización User Firebase ↔ Prisma
**Riesgo:** el usuario existe en Firebase pero no en Postgres en su primera petición.
**Decisión:** patrón *upsert on first authenticated request* por `firebaseUid` en `lib/auth`.

### 8. Gestión de secretos
**Decisión:** `.env.example` versionado y `.env.local` ignorado desde el commit inicial.

## 🟢 Mejoras (no bloquean el MVP)

- **Analítica:** PostHog (como la casa) desde el inicio, respetando privacidad.
- **Tests:** Jest + Testing Library + Playwright (convención de la casa) — al menos la
  lógica de agregación de la compra y del Duelo con tests desde el primer día.
- **i18n:** MVP solo en español, pero centralizar textos para no bloquear i18n futura.
- **SEO/landing:** `(marketing)` con metadata y sitemap para chef.merlinpot.com.
- **Trazabilidad de la lista:** guardar qué recetas contribuyeron a cada `ShoppingItem`
  para poder regenerar al cambiar el plan sin perder los "ya comprado".

## Legal / terceros

- YouTube: solo **embed** vía `youtube-nocookie`. Nunca descargar ni rehospedar vídeo.
- Recetas semilla: contenido propio o de licencia clara; marcar `isSeed = true`.
