# Marca — Chef by merlinpot

## 1. Concepto

**merlinpot** = *Merlin* (el mago) + *pot* (la olla). El estudio de desarrollo.
**Chef** es su primer producto: un **planificador mágico de comidas semanales**.

El hilo conductor de toda la marca es la **magia aplicada a lo cotidiano**: la comida de
la semana resuelta "como por arte de magia". Ese ángulo mágico:

- Diferencia a Chef del mar de apps de recetas en rojo/naranja.
- Da una narrativa natural al juego de descarte: *"deja que el mago elija por ti"*.
- Encaja con la voz (Alexa): el "mago" que te responde qué toca cenar.

## 1.b Cliente y persona

**Para quién es Chef (usuario principal): parejas y jóvenes profesionales urbanos, 28–38.**
Dos sueldos, poco tiempo entre semana, cocinan para 1–2 (a veces con un peque). No son
"foodies" ni gente de contar macros: quieren **comer bien sin dedicarle logística**.

**Persona guía — "Marta & Dani":**
- **Dolor:** la pregunta diaria *"¿qué cenamos?"* agota; acaban pidiendo a domicilio o
  improvisando mal; la compra se descontrola; repiten siempre lo mismo.
- **Contexto de uso:** móvil, de pie en la cocina a las 20:00 sin ideas, o el domingo por la
  noche planificando la semana, o en el súper con la lista.
- **Jobs-to-be-done:** (1) decidir **sin fricción** qué comer, (2) que la **compra salga sola**,
  (3) **variar** sin pensar, (4) **compartir el plan** con la pareja.
- **Enganches:** velocidad, "decide por mí" (**El Duelo**, **Rellena mi semana**), un diseño que
  apetece, hogar compartido.
- **Rechazos:** apps de nutrición pesadas, registrar calorías, tono infantiloide.

> La dieta/objetivos (Fase B) es **secundaria**: un filtro opcional, nunca la puerta de entrada.
> Familias y foco-salud son públicos de expansión, no el primero al que optimizamos.

## 1.c Posicionamiento

**Para** parejas y jóvenes profesionales que no tienen tiempo ni ganas de decidir qué comer,
**Chef** es el planificador de comidas que **resuelve la semana como por arte de magia**
—decides en segundos y la compra se genera sola—, **a diferencia de** las apps de recetas
(que solo dan ideas sueltas) y las de dieta (que exigen contar calorías).

- **Ambición:** producto B2C para **lanzar y crecer** (posible premium). La identidad debe
  competir en la App Store y transmitir confianza → **máxima inversión en marca**.
- **Promesa en una línea:** *menos pensar, mejor comer.*
- **Los tres momentos "wow"** que la marca debe hacer brillar: El Duelo (campeón), Rellena mi
  semana, y la lista de la compra que aparece sola.

## 2. Nombres y voz

- **Nombre de producto:** Chef
- **Dominio:** chef.merlinpot.com
- **Tagline (principal):** *"Tu semana, servida."*
- **Alternativas de tagline:** *"La cena resuelta, como por arte de magia."* ·
  *"Deja que el mago cocine tu semana."*

**Tono:** cálido, práctico y con un guiño juguetón/mágico. Habla de tú. Nunca cursi ni
recargado: primero resuelve el problema (qué comer, qué comprar), la magia es la sonrisa.

## 3. El juego de descarte — "El Duelo"

Cuando el usuario está indeciso, entra **El Duelo**: mecánica de torneo por descarte.

- Se enfrentan **dos platos** cara a cara → eliges uno → el ganador pasa de ronda.
- Se repite hasta que queda **un campeón**, que puedes asignar directo a un hueco de la semana.
- Ventaja clave: es **decisivo** (siempre sale un único plato) y **funciona por voz**
  (*"¿pasta o tacos?" → "tacos"*), lo que lo hace idóneo para Alexa en Fase 3.
- Framing mágico: *"El mago hace su conjuro..."* mientras baraja los candidatos.

Alternativa considerada (swipe estilo Tinder) descartada por ser menos decisiva y peor por voz.

## 4. Color

Decisión: **el púrpura-mago es el ancla** (no se cambia; se evoluciona). Paleta pensada para
el móvil en la cocina: apetecible, con el sello "mago", y con contraste sólido en claro/oscuro.
Las rampas se anclan a escalas probadas (violet / orange / stone de Tailwind) para accesibilidad.

### Roles

| Rol | Token | Hex | Uso |
|-----|-------|-----|-----|
| **Marca (primario)** | `brand` = brand-700 | `#6D28D9` | Marca, acción principal, magia, enlaces |
| **Acento (apetito)** | `paprika` = paprika-600 | `#EA580C` | Comida, CTA secundario, chispa de apetito |
| **Lienzo** | `cream` | `#FAF7F2` | Fondo cálido de la app |
| **Superficie** | `card` | `#FFFFFF` | Tarjetas, inputs, hojas |
| **Tinta** | `ink` = neutral-900 | `#1C1917` | Texto (se usa con opacidad para la escala de grises) |
| **Éxito** | `herb` = green-600 | `#16A34A` | Confirmaciones, "comprado" |
| **Peligro** | `danger` = red-600 | `#DC2626` | Destructivo (borrar/quitar) y errores |
| **Aviso** | `warn` = amber-500 | `#F59E0B` | Avisos no bloqueantes |

> ⚠️ **Corrección importante:** hoy `paprika` se usa a la vez como acento *y* como color de
> destructivo/error (p. ej. `hover:text-paprika` en "quitar", `error.tsx`). Eso mezcla
> "apetito" con "peligro". Se introduce **`danger` (rojo)** y el páprika deja de significar borrar.

### Escalas (50–950)

**Brand — púrpura mago (violet):**
`50 #F5F3FF · 100 #EDE9FE · 200 #DDD6FE · 300 #C4B5FD · 400 #A78BFA · 500 #8B5CF6 ·
600 #7C3AED · 700 #6D28D9 (★) · 800 #5B21B6 · 900 #4C1D95 · 950 #2E1065`

**Paprika — apetito (orange):**
`50 #FFF7ED · 100 #FFEDD5 · 200 #FED7AA · 300 #FDBA74 · 400 #FB923C · 500 #F97316 ·
600 #EA580C (★) · 700 #C2410C · 800 #9A3412 · 900 #7C2D12`

**Neutrales — cálidos (stone):**
`50 #FAFAF9 · 100 #F5F5F4 · 200 #E7E5E4 · 300 #D6D3D1 · 400 #A8A29E · 500 #78716C ·
600 #57534E · 700 #44403C · 800 #292524 · 900 #1C1917 (ink) · 950 #0C0A09`  ·  `cream #FAF7F2`

### Modo oscuro (seguimos `prefers-color-scheme`)

Como texto, bordes e iconos usan **`ink` con opacidad**, basta voltear los tokens base y aclarar
el púrpura para que los enlaces contrasten sobre fondo oscuro:

| Token | Claro | Oscuro |
|-------|-------|--------|
| `cream` (lienzo) | `#FAF7F2` | `#17130F` |
| `card` (superficie) | `#FFFFFF` | `#221C16` |
| `ink` (texto) | `#1C1917` | `#F2EEE8` |
| `brand` (primario) | `#6D28D9` | `#8B5CF6` |

### Reglas de accesibilidad (AA)

- **Texto/enlaces en púrpura:** usar `brand` (700) sobre claro (~5.9:1 ✓). En oscuro, `brand`
  vira a violet-500 para enlaces legibles.
- **Botón primario:** blanco sobre `brand-700` ≈ 5.9:1 ✓.
- **Páprika:** contraste bajo como texto pequeño (~3.4:1). Úsalo en **rellenos y acentos**, y para
  *texto* páprika tira de `paprika-700`. No es color de cuerpo de texto.
- **Nunca** transmitir estado solo por color (añadir icono/etiqueta): p. ej. "comprado" lleva check.

## 5. Tipografía

- **Titulares (display) — recomendado: *Fraunces*** (variable, óptico "Soft"). Serif cálida y
  con carácter que aporta el toque **artesano/mágico** y **diferencia** del mar de food-apps en
  sans geométrica. Uso: H1, tagline, y los momentos "wow" (Campeón de El Duelo, hero de la
  landing). Alternativa más juguetona-moderna: *Bricolage Grotesque* (sans).
- **Texto (body): *Inter*** — legible, neutra, ya en uso en la casa (y ya cargada con `next/font`).
- **Regla:** display solo en titulares y momentos de marca; nunca en párrafos ni en UI densa.
- Nota técnica: cargar la display con `next/font` (mismo patrón que Inter). Vigilar el build de
  Docker (descarga de Google Fonts); si falla, auto-hospedar con `next/font/local`.

## 6. Logo / marca gráfica

Concepto: una **olla** de la que sale vapor en forma de **estrellas/chispas** mágicas, o
donde la tapa insinúa un **gorro de mago**. La versión reducida (favicon/app icon) es la
olla con una chispa. Pendiente de diseño; este documento fija la dirección, no el arte final.

## 7. Iconografía

`lucide-react` (estándar de la casa) como base, con acentos de "chispa/estrella" para los
momentos mágicos (El Duelo, sugerencias automáticas).
