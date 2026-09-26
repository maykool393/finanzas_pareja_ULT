# Sistema de diseño — Finanzas en pareja

Documento de referencia para desarrollo. Úsalo como contexto al pedirle a Claude Code que construya componentes. Es la fuente de verdad: si el código y este documento no coinciden, se corrige uno de los dos a propósito, nunca se deja la diferencia.

Algunas reglas de este documento todavía no están aplicadas en el código. Cada una indica la etapa del plan que la resuelve (M3 a M6, ver README § Plan de mejoras).

## Stack

- React + TypeScript
- Vite
- Supabase (base de datos + autenticación)
- CSS + variables nativas (sin Tailwind)

## Skills y precedencia

Las skills de diseño instaladas en `.claude/skills/` guían el trabajo, pero no todas pesan igual. Orden de precedencia, de mayor a menor:

1. **Las decisiones de este documento.** Son decisiones explícitas del producto (el degradado de marca, los botones de 8px, los íconos propios) y ganan sobre cualquier skill.
2. **`impeccable`, en modo Operate**, para todas las pantallas de la app: dashboard, listas, formularios, ajustes y los pasos del onboarding. En Operate mandan la consistencia, la legibilidad y las expectativas estándar, no la expresión. Solo la pantalla de bienvenida (`Welcome`) puede tratarse en modo Persuade.
3. **`emil-design-eng`** para interacción y movimiento. Las skills de animación (`animate`, `review-animations`, `improve-animations`, `find-animation-opportunities`) aplican el mismo marco.

Cómo resolver un conflicto:
- Si una skill contradice este documento, gana el documento.
- Si el documento no dice nada, aplica la skill.
- Si la skill tiene razón y el documento no, primero se cambia el documento (como decisión explícita) y después el código.

**Skills que se descartaron** (2026-09-26) y por qué, para no reinstalarlas sin revisar: `high-end-visual-design` y `design-taste-frontend` están pensadas para sitios de agencia y landing pages (botones píldora, secciones enormes, animaciones de entrada de 800ms, prohibición de íconos propios). `minimalist-ui` y `redesign-existing-projects` prohíben el degradado de marca y los botones que ya se decidieron; lo que tenían de útil ya lo cubre `impeccable`.

## Filosofía visual

Base neutra en tonos grises. El color se reserva exclusivamente para elementos con significado financiero: cuentas, deudas, inversiones y categorías. El resto de la interfaz (texto, navegación, iconos estructurales) se mantiene en gris para que el color no compita por atención y siempre indique algo específico.

La única excepción es la identidad de marca en los flujos de onboarding (ver más abajo).

## Tipografía

```css
--font-sans: 'Ubuntu', system-ui, sans-serif;
--font-mono: 'Ubuntu Mono', ui-monospace, 'SF Mono', Menlo, monospace;
```

Una sola familia para toda la interfaz: títulos, botones, etiquetas, datos. `--font-mono` solo para códigos y datos que se leen carácter por carácter (ej. el código de invitación), nunca como adorno.

**Carga:** siempre con `font-display: swap`, para no dejar texto invisible mientras carga. Las fuentes deben alojarse en el propio proyecto, no en Google Fonts: la app es una PWA y sin conexión no puede pedirlas a un servidor externo. *(Hoy se cargan desde Google Fonts; se corrige en M5.)*

| Token | Valor | Uso |
|---|---|---|
| `--text-2xs` | 11px | Etiquetas (`.label`, mayúsculas) |
| `--text-xs` | 12px | Hints, metadatos |
| `--text-sm` | 14px | Texto de controles y listas |
| `--text-md` | 16px | Texto base, inputs |
| `--text-lg` | 20px | Títulos de pantalla y diálogo |
| `--text-xl` | 28px | Títulos destacados |
| `--text-2xl` | 40px | Saldo principal |

- Pesos: `--weight-light` 300, `--weight-regular` 400, `--weight-medium` 500, `--weight-bold` 700.
- Interlineado: `--leading-tight` 1.15 (títulos), `--leading-normal` 1.5 (texto).
- Espaciado de etiquetas: `--tracking-label` 0.06em.
- Todo monto usa la clase global `.amount`, con cifras tabulares (`font-variant-numeric: tabular-nums`) para que las columnas no bailen.

## Modo claro / oscuro

Debe soportarse desde el inicio, no agregarse después. Usar `[data-theme="dark"]` para el toggle manual, con fallback a `prefers-color-scheme` para la preferencia del sistema.

```css
:root {
  color-scheme: light;
}
[data-theme="dark"] {
  color-scheme: dark;
}
```

## Colores — superficies y texto (neutros)

| Variable | Claro | Oscuro | Uso |
|---|---|---|---|
| `--surface-page` | `#ffffff` | `#121212` | Fondo de página |
| `--surface-card` | `#FAFAFA` | `#1e1e1e` | Tarjetas, diálogos |
| `--surface-sunken` | `#efefe8` | `#262626` | Inputs; feedback de hover |
| `--surface-inverse` | `#1a1a1a` | `#f0f0f0` | Botón primario |
| `--text-primary` | `#1a1a1a` | `#f0f0f0` | Texto principal |
| `--text-secondary` | `#5f5e5a` | `#a8a8a4` | Texto de apoyo |
| `--text-muted` | `#6d6c66` | `#8d8d8a` | Etiquetas, hints, placeholders (`::placeholder` en `global.css`) |
| `--text-inverse` | `#ffffff` | `#121212` | Texto sobre `--surface-inverse` |
| `--border` | `#e0e0da` | `#2e2e2e` | Bordes y divisores |
| `--border-strong` | `#c7c6be` | `#3d3d3a` | Bordes de inputs y botones secundarios |

**Contraste mínimo:** todo texto normal debe llegar a 4.5:1 y el texto grande (24px o más, o 19px en negrita) a 3:1, medido contra las tres superficies de su modo: página, tarjeta y hundida. Los valores de `--text-muted` se eligieron así: el más cercano al original que cumple 4.5:1 contra las tres (claro: 5.3 / 5.1 / 4.6; oscuro: 5.6 / 5.0 / 4.6). El `--text-muted` anterior daba entre 3.0 y 3.7:1.

Pares ya medidos que cumplen: texto de las tarjetas de categoría sobre su fondo (12:1 o más), título y acento sobre `--gradient-brand-light` (12.9–14:1 y 4.6–5.0:1), texto del CTA sobre `--gradient-brand-dark` (5.3–6.5:1). Un par nuevo de texto y fondo se mide antes de usarlo.

## Colores — categorías financieras (constantes en ambos modos)

Cada categoría tiene un color de fondo claro (`bg`) y su versión oscura de texto (`text`) para mantener contraste correcto sobre el fondo de color — nunca usar negro genérico sobre estos fondos.

### Cuentas
```css
--account-a-bg: #EAF3DE;
--account-a-text: #173404;   /* Ej: Banesco */
--account-b-bg: #EEEDFE;
--account-b-text: #26215C;   /* Ej: Caixa Bank */
--account-b: #7F77DD;        /* tono base, solo para fondos y efectos (RippleBackground) */
```

### Deudas
```css
--debt-a-bg: #FAECE7;
--debt-a-text: #4A1B0C;      /* Ej: préstamo grande */
--debt-a-fill: #D85A30;      /* color de la barra de progreso */
--debt-b-bg: #FBEAF0;
--debt-b-text: #4B1528;      /* Ej: compra a cuotas */
--debt-b-fill: #D4537E;
```

### Inversiones
```css
--investment-a-bg: #EEEDFE;   /* misma familia que --account-b */
--investment-a-text: #26215C;
--investment-b-bg: #EAF3DE;   /* misma familia que --account-a */
--investment-b-text: #173404;
```

**Regla de asignación:** cada cuenta/deuda/inversión nueva del usuario rota entre las variantes disponibles (a, b, c...) para diferenciarse visualmente de las demás del mismo tipo. Si se necesitan más de 2 variantes por categoría, definirlas siguiendo el mismo patrón antes de implementar.

### Ganancia, pérdida y peligro

Cada color de estado tiene dos usos con requisitos distintos: como relleno (barras, gráficos, íconos) basta 3:1; como texto hace falta 4.5:1. Por eso existen dos juegos de tokens.

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--gain-color` | `#639922` | `#639922` | Rellenos y barras de variación positiva |
| `--loss-color` | `#D85A30` | `#D85A30` | Rellenos y barras de variación negativa |
| `--gain-text` | `#4d771b` | `#669b26` | Montos positivos y texto de éxito |
| `--loss-text` | `#b54c28` | `#dc6c47` | Montos negativos y mensajes de error |
| `--danger-bg` | `#b14a28` | `#b14a28` | Fondo de botones destructivos |
| `--text-on-danger` | `#ffffff` | `#ffffff` | Texto sobre `--danger-bg` |

- Nunca usar `--gain-color` ni `--loss-color` como color de texto: dan 3.4:1 y 3.9:1 sobre fondo claro.
- `--text-on-danger` es blanco fijo en ambos modos (no `--text-inverse`, que en oscuro pasa a casi negro y sobre `--danger-bg` no llega a 4.5:1).
- `--danger-bg` da 5.4:1 en reposo, con margen para el hover: los botones bajan la opacidad a 0.9 al pasar el mouse, lo que aclara el fondo. Con un rojo al límite de 4.5:1, el hover quedaba en 3.9:1.
- **El contraste se mide en todos los estados**, no solo en reposo: hover, foco y seleccionado también tienen que llegar a 4.5:1. Solo el estado deshabilitado está exento.

## Espaciado, bordes y elevación

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;

--radius-card: 12px;
--radius-control: 8px;
--radius-full: 999px;   /* solo píldoras pequeñas: barras de progreso, avatares, botones de solo ícono */

--shadow-sm: 0 1px 2px rgba(26, 26, 26, 0.06);
--shadow-md: 0 2px 12px rgba(26, 26, 26, 0.08);
```

- **Una sola elevación por superficie:** borde o sombra, no ambos. Un borde de 1px bajo una sombra difusa se lee como una tarjeta fantasma. *(Hoy `Card` tiene los dos; se corrige en M6.)*
- **Nada de tarjetas dentro de tarjetas.** Si algo necesita separarse dentro de una tarjeta, se usa espacio o un divisor.
- Layout: `--container-max` 1120px, `--header-height` 64px.

## Identidad de marca — flujos de varios pasos (onboarding)

Distinto del fondo de Login/recuperar contraseña/crear cuenta (sección siguiente): ese es un asset estático de manchas difuminadas para pantallas de un solo formulario. Esto es un degradado CSS para flujos que avanzan por pasos (ej. configurar hogar), donde sí se permite salir de la base neutra porque el degradado *es* la identidad visual del flujo, no un elemento decorativo de fondo.

```css
--brand-pink: #FFB4E2;
--brand-blue: #89BBF0;
--gradient-brand:       linear-gradient(94.58deg, var(--brand-pink) -18.95%, var(--brand-blue) 111.62%);
--gradient-brand-light: linear-gradient(94.58deg, #FFDDF2 -18.95%, #CAE0F8 111.62%);
--gradient-brand-dark:  linear-gradient(94.58deg, #C78CB0 -18.95%, #6B92BB 111.62%);
```

Mismos dos tonos (rosa → azul) y mismo ángulo en las tres variantes — solo cambia cuánto blanco/negro se mezcla. `-light` y `-dark` existen para que un elemento pueda distinguirse de otro que también usa el degradado (ej. la barra de progreso sobre el fondo del encabezado): nunca se inventa un tono nuevo, se aclara u oscurece el mismo par.

**Reglas de uso:**
- Encabezado del flujo (`--gradient-brand-light`): cubre desde el borde superior de la pantalla — nunca debe quedar una franja de fondo neutro por encima.
- Segmento(s) completados de la barra de progreso, botón de acción principal del flujo y borde de la opción seleccionada en tarjetas de elección: `--gradient-brand-dark` — todos más oscuros que el encabezado para distinguirse de él.
- `--brand-pink` / `--brand-blue` sólidos (sin degradado): avatares del componente `AvatarPair`.
- `--gradient-brand` (variante base): no se aplica directo a ningún elemento; es el par de origen del que salen `-light` y `-dark`.
- Texto sobre cualquiera de las tres variantes: siempre oscuro — el texto blanco no llega al contraste mínimo (AA) contra ninguna de ellas. Como el degradado no cambia con `[data-theme="dark"]`, el texto y los íconos sobre él usan `#1a1a1a` literal, no `--text-primary` (que sí se invierte en modo oscuro).
- No sustituye los colores de categorías financieras ni se usa fuera de flujos de onboarding.
- Nunca como texto con degradado: el énfasis se da con peso o tamaño.
- Pendiente: no tiene variante para modo oscuro — hoy se ve igual en claro y oscuro. Definir si corresponde antes de extenderlo a más pantallas.

## Botones

| Variante | Fondo | Texto | Borde |
|---|---|---|---|
| Primario | `--surface-inverse` | `--text-inverse` | — |
| Secundario | `--surface-page` | `--text-primary` | 1px `--border-strong` |
| Destructivo | `--danger-bg` | `--text-on-danger` | — |
| CTA de onboarding | `--gradient-brand-dark` | `#1a1a1a` fijo | — |

- **Radio:** `--radius-control` (8px) para todo botón con texto, incluidas las tarjetas de selección tipo radio.
- **Excepción, botones de solo ícono** (cambiar tema, cerrar diálogo, agregar): pueden ser circulares (`--radius-full`). Son controles pequeños sin texto, y un círculo es la forma esperada para ellos.
- **Área táctil mínima de 44×44px** para todo lo que se presiona. Un botón de ícono puede verse de 28–32px, pero su zona de toque llega a 44px con padding o con un pseudo-elemento. *(Hoy hay botones de 28 a 40px; se corrige en M3.)*
- **Botón secundario: nunca relleno gris**, se confunde con un estado deshabilitado. `--surface-sunken` queda reservado para el feedback de hover.
- **Enlaces de texto** (copiar, volver, "¿Tienes un código?") no llevan fondo ni radio, solo color de texto que se oscurece en hover.
- **Estados obligatorios:** default, hover, `:active`, `:focus-visible` (anillo global de `reset.css`), deshabilitado (`opacity: 0.6`) y cargando (texto de acción en gerundio, ej. "Guardando…").

## Fondo — pantallas de autenticación (login, recuperar contraseña, crear cuenta)

Estas tres pantallas comparten el mismo fondo: un degradado difuminado en tonos pastel sobre base clara, generado a partir de los mismos colores de categoría del sistema (no introduce paleta nueva).

**Asset:** `login-background.png` — 1080×2340px (proporción de pantalla móvil), reutilizable como imagen de fondo fija en las tres pantallas. *(Pesa 2.2 MB por modo; se convierte a WebP/AVIF en M5.)*

**Composición:**
- Base: blanco (`#ffffff`).
- Manchas difuminadas en cuatro tonos, mezcladas con opacidad alta para que se noten claramente sobre el blanco:
  - Morado (`--account-b`, `#7F77DD`) — zona izquierda/inferior.
  - Coral (`--debt-a-fill`, `#D85A30`) — zona derecha.
  - Rosa (`--debt-b-fill`, `#D4537E`) — zona superior central.
  - Verde (`--gain-color`, `#639922`) — zona inferior.
- Ligera profundidad adicional (sutil, no oscurecimiento fuerte) detrás de donde se ubica el ícono/logo de la app, en la parte superior centrada, para que el ícono destaque sin perder la sensación de fondo claro.
- Grano/dither muy sutil aplicado para evitar bandas de color en el degradado.

**Reglas de uso:**
- El fondo va tras todo el contenido (`z-index` más bajo), fijo o cubriendo el viewport completo.
- Como el fondo es claro y con color, el formulario (inputs, botones, texto) va sobre una tarjeta semi-opaca (`color-mix(in srgb, var(--surface-card) 60%, transparent)`) para mantener contraste — no colocar texto directo sobre el degradado.
- Mismo asset y mismas reglas de tarjeta para las tres pantallas, variando solo el contenido del formulario.
- El fondo tiene una variante para cada modo, con la misma composición de color y posición de manchas — solo cambia la base:
  - Modo claro: `login-background.png` — base blanca (`#ffffff`).
  - Modo oscuro: `login-background-dark.png` — base oscura (`#121212`, mismo valor que `--surface-page` en modo oscuro).
- El componente de fondo (`RippleBackground`) alterna entre ambos assets según `data-theme`. Sus ondas al tocar solo deben dibujarse mientras existen: sin ondas, el loop de animación se detiene; con reducir movimiento, no se dibujan. *(Hoy el loop corre siempre; se corrige en M5.)*

## Montos y moneda

- **La moneda es del hogar**, no fija en el código: se elige en el onboarding y se guarda en `households.currency`. Monedas disponibles: CLP, USD, EUR, MXN, COP, ARS, PEN.
- Todo monto visible pasa por `formatCurrency(amount, currency)` (`src/lib/format.ts`), con la moneda que entrega `useCurrency()`. Nunca escribir un símbolo ni un código de moneda a mano.
- **Se muestra el símbolo, no el código:** `€1.234`, `S/1.234`, `$1.234`. Los símbolos están en un mapa explícito en `format.ts`, porque `Intl` con el locale `es-CL` muestra código para las monedas no locales y no trae `S/` para PEN. Para agregar una moneda, se suma al mapa: el selector del onboarding se arma desde ahí.
- Varias monedas comparten el símbolo `$`. Dentro de un hogar no confunde, porque hay una sola moneda. Si alguna pantalla llega a mostrar montos de monedas distintas, ahí hay que volver a mostrar el código.
- Formato: locale `es-CL`, sin decimales (los montos se guardan en la unidad menor), clase `.amount` para cifras tabulares.
- Los inputs de monto (`NumberField`) anteponen el símbolo de la moneda del hogar.

## Componentes clave

**Tarjeta de cuenta/deuda/inversión**
- Fondo de color de categoría, radio `--radius-card`, padding `--space-md`.
- Icono representativo + nombre en la parte superior.
- Monto grande y destacado debajo.
- Icono de persona (avatar) en la esquina inferior derecha para indicar de quién es.

**Barra de progreso (deudas, presupuestos)**
- Altura 5px, radio `--radius-full`.
- Fondo en el tono claro de la categoría, relleno en el tono `fill`.
- Largo proporcional a pagos completados / pagos totales, animado con `transform: scaleX()` y `transform-origin: left`, nunca con `width`. *(Hoy anima `width`; se corrige en M4.)*

**Encabezado de sección (Cuentas / Deudas / Inversiones)**
- Nombre de sección en `--text-primary`, monto total alineado a la derecha en `--text-secondary`.
- Ícono chevron (no check) para indicar que la sección es expandible/colapsable.

**Diálogo**
- En móvil es una hoja inferior (bottom sheet); desde 640px, un diálogo centrado.
- Al abrir, el foco va al primer campo del contenido, no al botón de cerrar. Mientras está abierto, el foco no puede salir del diálogo con Tab. Al cerrar, vuelve al elemento que lo abrió. Escape cierra. *(Hoy el foco inicial va al botón de cerrar y no queda contenido ni se devuelve; se corrige en M3.)*
- Entra deslizándose desde abajo (hoja) o con fundido y escala desde 0.97 (centrado); la salida es más rápida que la entrada. *(Se agrega en M4.)*

**Toggle de modo oscuro**
- Debe estar accesible desde la pantalla principal.

**Barra de progreso por pasos (onboarding)**
- Un segmento por paso, dentro del área del degradado de marca (ver "Identidad de marca") — nunca sobre una franja neutra separada.
- Segmento(s) completados: relleno con `--gradient-brand-dark`. Pendientes: tono oscuro translúcido (`rgba(26, 26, 26, 0.18)`) sobre el degradado del encabezado.
- Mismo patrón para cualquier flujo de varios pasos, no solo vincular hogar.

**Tarjeta de selección (radio-card)**
- El grupo es un `role="radiogroup"` con etiqueta; cada opción es un `<button>` real con `role="radio"` y `aria-checked`.
- Borde de 2px en ambos estados, para que seleccionar no mueva el layout. Estado activo: el borde toma `--gradient-brand-dark`. Estado inactivo: `--border`.
- El fondo no cambia entre estados — seleccionar nunca rellena la tarjeta de color, la marca solo el borde.
- Variante en fila (ícono + título + descripción + radio circular a la derecha) para listas de opciones con más texto, ej. cómo repartir gastos. Mismo borde degradado en el estado activo; el punto del radio interno sí se rellena en `--text-primary` (affordance estándar de radio, no "color de marca").

## Transiciones y animación

Esta es una app de uso diario: el movimiento comunica un cambio de estado, no decora. Marco de `emil-design-eng`.

**¿Debe animarse?** Según cuántas veces lo ve el usuario:

| Frecuencia | Decisión | Ejemplos |
|---|---|---|
| Muchas veces al día, o con teclado | Sin animación | Atajos, navegación entre pestañas |
| Varias veces al día | Mínima: color u opacidad | Hover, expandir secciones |
| Ocasional | Animación estándar | Diálogos, confirmaciones |
| Primera vez o poco frecuente | Puede tener más carácter | Pasos del onboarding |

**Tokens:**
```css
--ease-out: cubic-bezier(0.2, 0.8, 0.2, 1);
--duration-fast: 150ms;   /* presión, hover, color */
--duration-base: 220ms;   /* diálogos, expandir, entradas */
```

**Reglas:**
- Animar solo `transform` y `opacity`. El color se puede transicionar (hover, cambio de tema). Nunca `width`, `height`, `top`, `left`, `margin` ni `padding`.
- Duración entre 150 y 250ms; ningún elemento de interfaz pasa de 300ms.
- Entradas y salidas con `--ease-out`. Nunca `ease-in` ni `transition: all`.
- La salida es más rápida que la entrada: el sistema responde rápido cuando el usuario ya decidió.
- Nada aparece desde `scale(0)`: se parte de `scale(0.95)` o más, junto con `opacity: 0`.
- **Presión:** todo lo que se presiona responde en `:active` con `transform: scale(0.97)` y una transición de `transform` de `--duration-fast`. *(Hoy solo lo tienen el CTA del onboarding y las tarjetas de selección; se extiende en M4.)*
- **Hover solo con puntero fino:** los efectos de hover van dentro de `@media (hover: hover) and (pointer: fine)`, para que en pantallas táctiles no queden pegados después de tocar. *(M4.)*
- **Reducir movimiento** (`prefers-reduced-motion: reduce`) significa menos movimiento, no ninguno: se quitan desplazamientos y escalas, pero se mantienen los fundidos de opacidad y las transiciones de color, que ayudan a entender el cambio. *(Hoy se ponen todas las duraciones en 0ms; se corrige en M4.)*
- Preferir transiciones CSS antes que `@keyframes` en todo lo que se puede interrumpir (abrir y cerrar rápido): una transición se retoma desde donde está, un keyframe reinicia.
- Casos de uso: expandir/colapsar secciones, aparición de nuevas transacciones (fundido/deslizamiento), conteo animado al actualizar montos, transición de color al cambiar entre modo claro/oscuro, entrada y salida de diálogos.

## Iconografía

Estilo outline (contorno), no relleno. Consistente en todos los íconos de la app — cuentas, navegación inferior, indicadores de categoría.

- **Íconos propios, no de librería.** Viven todos en `src/components/ui/icons.tsx`, sobre una grilla de 20×20 (`viewBox="0 0 20 20"`), trazo de 1.5 (`strokeWidth="1.5"`), extremos y uniones redondeados, color `currentColor`. Un ícono nuevo se agrega ahí, no dentro del componente que lo usa. *(`AppShell` y `Dialog` todavía tienen íconos propios con trazo 1.6; se unifican en M6.)*
- Ningún emoji ni carácter Unicode en lugar de un ícono.

**Excepción:** los íconos del componente `AvatarPair` (persona, corazón) van rellenos. Son un acento decorativo puntual de los flujos de onboarding, no íconos estructurales o de navegación.

## Texto de la interfaz

- Los botones nombran su acción ("Crear", "Unirme", "Guardar contraseña"), no "Aceptar" ni "Enviar".
- Los errores dicen qué pasó y cómo seguir: "Ese código no es válido. Pídele a tu pareja que lo copie de nuevo desde 'Ver más'."
- Sin guion largo (—) en el texto visible: se reemplaza por punto, coma, dos puntos o paréntesis. *(Quedan 4 casos; se corrigen en M6.)*

## Superficies del navegador

Lo que dibuja el navegador también es parte del diseño: la selección de texto, las barras de scroll y el anillo de foco toman colores de la paleta, no los del navegador. El anillo de foco ya está definido en `reset.css` (2px `--text-primary`). *(Selección y barras de scroll se agregan en M6.)*

## Navegación inferior

Cinco secciones: Finanzas, Presupuesto, Mover (transferencias), Estadísticas, Ver más. Ítem activo en `--text-primary`, resto en `--text-secondary`.
