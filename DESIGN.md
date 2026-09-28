# Sistema de diseño — Finanzas en pareja

Documento de referencia para desarrollo. Úsalo como contexto al pedirle a Claude Code que construya componentes. Es la fuente de verdad: si el código y este documento no coinciden, se corrige uno de los dos a propósito, nunca se deja la diferencia.

**Origen del diseño actual** (2026-09-28): el prototipo "Twoney" (artefacto en claude.ai, chat "Twoney onboarding design"). Reemplaza la identidad anterior (degradado rosa → azul sobre grises cálidos) en toda la app, incluido el login. Donde el prototipo no cumplía contraste o las reglas de este documento, aquí está la versión corregida: manda este documento, no el prototipo.

## Stack

- React + TypeScript
- Vite
- Supabase (base de datos + autenticación)
- CSS + variables nativas (sin Tailwind)

## Skills y precedencia

Las skills de diseño instaladas en `.claude/skills/` guían el trabajo, pero no todas pesan igual. Orden de precedencia, de mayor a menor:

1. **Las decisiones de este documento.** Son decisiones explícitas del producto (la paleta slate con turquesa, el radio de 8px, los íconos propios, las animaciones del Resumen) y ganan sobre cualquier skill.
2. **`impeccable`, en modo Operate**, para todas las pantallas de la app: resumen, patrimonio, listas, formularios, ajustes y los pasos del onboarding. En Operate mandan la consistencia, la legibilidad y las expectativas estándar, no la expresión. Solo la pantalla de bienvenida (`Welcome`) puede tratarse en modo Persuade.
3. **`emil-design-eng`** para interacción y movimiento. Las skills de animación (`animate`, `review-animations`, `improve-animations`, `find-animation-opportunities`) aplican el mismo marco.

Cómo resolver un conflicto:
- Si una skill contradice este documento, gana el documento.
- Si el documento no dice nada, aplica la skill.
- Si la skill tiene razón y el documento no, primero se cambia el documento (como decisión explícita) y después el código.

**Skills que se descartaron** (2026-09-26) y por qué, para no reinstalarlas sin revisar: `high-end-visual-design` y `design-taste-frontend` están pensadas para sitios de agencia y landing pages (botones píldora, secciones enormes, animaciones de entrada de 800ms, prohibición de íconos propios). `minimalist-ui` y `redesign-existing-projects` prohíben los degradados de marca y los botones que ya se decidieron; lo que tenían de útil ya lo cubre `impeccable`.

## Filosofía visual

Base neutra en tonos slate: grises fríos, levemente azulados, en ambos modos. Texto, navegación inactiva e íconos estructurales van en slate.

El color tiene tres usos, y ninguno es decorativo:
1. **Marca (turquesa):** la acción principal y lo activo. Botón principal, botón flotante, pestaña activa, opción seleccionada, enlaces.
2. **Personas:** cada miembro del hogar tiene su color (turquesa e índigo) para saber de un vistazo de quién es algo.
3. **Datos:** los tonos de las tarjetas distinguen cuentas, deudas, inversiones y categorías; las series de los gráficos, ganancia y pérdida.

Las únicas piezas decorativas son las manchas difuminadas del fondo (onboarding, login, historias del Resumen), el número de paso de fondo y las ilustraciones. Ninguna lleva información.

## Tipografía

```css
--font-sans: 'Ubuntu', system-ui, sans-serif;
--font-mono: 'Ubuntu Mono', ui-monospace, 'SF Mono', Menlo, monospace;
```

Una sola familia para toda la interfaz: títulos, botones, etiquetas, datos. `--font-mono` solo para códigos y datos que se leen carácter por carácter (el código de invitación), nunca como adorno.

**Carga:** siempre con `font-display: swap`, para no dejar texto invisible mientras carga. Las fuentes se alojan en el propio proyecto, no en Google Fonts: la app es una PWA y sin conexión no puede pedirlas a un servidor externo. Se importan desde Fontsource (`@fontsource/ubuntu`, `@fontsource/ubuntu-mono`) en `main.tsx`, **solo el subconjunto latino** (cubre el español completo, `€` y `−`) y **solo los pesos en uso**: Ubuntu 300, 400, 500 y 700; Ubuntu Mono 400.

**Pesos:** Ubuntu solo existe en 300, 400, 500 y 700. El prototipo usaba 200, 600 y 800, que el navegador simulaba (y se ven mal). Equivalencias:

| Token | Valor | Uso | En el prototipo |
|---|---|---|---|
| `--weight-light` | 300 | Número de paso y de historia (marca de agua) | 200 |
| `--weight-regular` | 400 | Texto base, nombre en las tarjetas de patrimonio | 400 |
| `--weight-medium` | 500 | Etiquetas, acciones secundarias, pestaña inactiva, input del nombre, valor del balance | 500 y 600 |
| `--weight-bold` | 700 | Títulos, montos, CTA, pestaña activa, enlaces de acción | 700 y 800 |

**Escala:** el prototipo usaba unos 20 tamaños (de 9.5 a 96px); se reducen a estos. Un tamaño que no está aquí se lleva al token más cercano.

| Token | Valor | Uso |
|---|---|---|
| `--text-2xs` | 11px | Etiquetas en mayúsculas (`.label`), iniciales de avatar, texto de la barra inferior |
| `--text-xs` | 12px | Hints, metadatos, fechas, píldoras de porcentaje |
| `--text-sm` | 14px | Texto de controles y listas, descripciones de opciones, ayudas bajo los títulos |
| `--text-md` | 16px | Texto base, inputs, CTA, título de una opción |
| `--text-lg` | 18px | Nombre en la tarjeta de patrimonio, título de las opciones grandes del onboarding |
| `--text-xl` | 20px | Títulos de sección (Cuentas, Deudas), input del nombre del hogar, código de invitación |
| `--text-2xl` | 24px | Títulos de las historias, montos de la hoja de composición, input del código para unirse |
| `--text-3xl` | 28px | Título de cada paso del onboarding y de la pantalla final |
| `--text-4xl` | 32px | Montos grandes: patrimonio, tarjetas, balance, "por saldar" |
| `--text-watermark` | 96px | Número de paso y de historia (decorativo) |

- Interlineado: `--leading-tight` 1.15 (títulos), `--leading-normal` 1.5 (texto).
- Espaciado: `--tracking-label` 0.06em (etiquetas en mayúsculas y el mes del Resumen), `--tracking-code` 0.1em (códigos), `--tracking-amount` −0.01em (montos de `--text-2xl` para arriba).
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

El tema elegido a mano se guarda en `localStorage` (`theme`) y lo aplica un script pequeño en `index.html`, antes del primer pintado. Si lo aplicara React, cada pantalla se pintaría primero con el tema del sistema y después cambiaría, y las pantallas que no usan `useTheme` (bienvenida, onboarding) no lo aplicarían nunca.

El modo oscuro es **slate azulado**, no gris neutro: la misma familia fría del modo claro, oscurecida. Hay tres cosas que **no cambian con el tema** (decidido el 2026-09-28):
- La **cabecera de la app** (`--surface-header`, `#0F172A`). En oscuro se separa de la página con un borde inferior `rgba(255, 255, 255, 0.08)`, porque su color y el de la página casi no se distinguen.
- La **historia "Gastos compartidos"** del Resumen, que es oscura en ambos modos.
- El **degradado de marca**, el color de cada persona y los botones destructivos.

## Colores — superficies y texto

| Variable | Claro | Oscuro | Uso |
|---|---|---|---|
| `--surface-page` | `#F8FAFC` | `#0E1627` | Fondo de página (color sólido de respaldo) |
| `--gradient-page` | `160deg, #F8FAFC → #F1F5F9` | `160deg, #0E1627 → #0B1120` | Fondo de página. El contraste se mide contra los dos extremos |
| `--surface-card` | `#FFFFFF` | `#141D2F` | Tarjetas neutras, hojas, diálogos, barra inferior |
| `--surface-sunken` | `#F1F5F9` | `#1C2638` | Hover, rieles de barras, píldoras, botones de ícono, esqueletos de carga |
| `--surface-header` | `#0F172A` | `#0F172A` | Cabecera de la app (fija) |
| `--surface-on-header` | `rgba(255,255,255,0.10)` | igual | Selector y botones sobre la cabecera |
| `--text-primary` | `#0F172A` | `#F1F5F9` | Texto principal |
| `--text-secondary` | `#475569` | `#B4C0D2` | Texto de apoyo |
| `--text-muted` | `#5B6B80` | `#8C9AB0` | Etiquetas, hints, placeholders, pestaña inactiva |
| `--text-disabled` | `#94A3B8` | `#56657A` | Solo controles deshabilitados (exentos de contraste) |
| `--text-on-header` | `#FFFFFF` | igual | Texto sobre la cabecera y la historia oscura |
| `--text-on-header-muted` | `rgba(255,255,255,0.65)` | igual | Texto de apoyo sobre la cabecera y la historia oscura (8.0 y 6.8:1) |
| `--border` | `#E2E8F0` | `#243047` | Divisores y bordes decorativos |
| `--border-strong` | `#CBD5E1` | `#334155` | Bordes de contenedores y botones secundarios (decorativos) |
| `--border-control` | `#7C8BA1` | `#6B7A90` | Borde que identifica un campo o un radio (≥3:1) |
| `--scrim` | `rgba(15,23,42,0.55)` | `rgba(2,6,23,0.7)` | Velo detrás de hojas y diálogos |

**Por qué hay tres bordes:** el borde de un input o de un radio es lo único que muestra dónde está el control, y necesita 3:1 (WCAG 1.4.11). `--border` y `--border-strong` no llegan (1.2 y 1.5:1), así que solo se usan donde el borde no identifica nada (divisores, el marco de una tarjeta que ya tiene texto). Todo campo usa `--border-control`.

### Contraste

- **Texto:** 4.5:1; texto grande (24px o más, o 19px en negrita), 3:1.
- **No texto:** 3:1 para todo lo que informa. Es decir: bordes de campos, íconos que no llevan texto al lado, indicadores de estado (seleccionado, activo, progreso) y series de gráficos.
- **Dónde se mide:** contra todas las superficies donde aparece en su modo (los dos extremos de `--gradient-page`, `--surface-card`, `--surface-sunken`) y en todos los estados (hover, foco, seleccionado). Solo el estado deshabilitado está exento.
- **Exento, por ser decorativo:** manchas del fondo, números de marca de agua, divisores, ilustraciones y muestras del selector de color.
- **La opacidad nunca baja un texto de 4.5:1.** Si algo tiene que verse "atenuado", se atenúa lo gráfico, no el texto (ver la hoja de composición).
- **Colores medidos y descartados del prototipo:**
  - Turquesa `#12D4C4` como ícono o borde sobre claro: 1.9:1.
  - Turquesa `#0B8999` como texto: 4.2:1.
  - Gris `#94A3B8` en la pestaña inactiva: 2.6:1.
  - Índigo `#818CF8` como gráfico sobre claro: 2.9:1.
  - Texto blanco al 45% sobre la cabecera: 4.46:1 (se usa 65%, 8.0:1).
  - Pie de la tarjeta de deuda con `rgba(15,23,42,0.55)`: 3.6:1.
  - Línea del input subrayado en `#CBD5E1`: 1.5:1.
- Un par nuevo de texto y fondo se mide antes de usarlo, y se agrega aquí.

## Marca

```css
--brand:          #12D4C4;                                             /* fijo */
--brand-end:      #10C2D8;                                             /* fijo */
--gradient-brand: linear-gradient(135deg, #12D4C4 0%, #10C2D8 100%);  /* fijo */
--text-on-brand:  #0F172A;   /* texto e íconos sobre --brand o el degradado, fijo (8.3–10.4:1) */
```

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--brand-strong` | `#0B8F86` | `#12D4C4` | Íconos, bordes y rellenos que informan sobre superficie neutra: estado seleccionado, pestaña activa, progreso, series (3.6–4.0:1 en claro) |
| `--brand-text` | `#097A88` | `#12D4C4` | Texto turquesa: enlaces, montos positivos (4.6–5.1:1 en claro) |
| `--brand-tint` | `#E7FBF9` | `#143341` | Fondo de lo seleccionado y burbujas de íconos |
| `--selection` | `#D4F7F4` | `rgba(18,212,196,0.30)` | `::selection` |

**Reglas de uso:**
- **El turquesa claro solo va de fondo.** `--brand` y `--gradient-brand` se usan como relleno de algo que lleva texto o ícono oscuro encima (CTA, botón flotante, avatar), o sobre fondos oscuros. Sobre una superficie clara no llegan a 3:1, así que ahí un ícono, un borde o un gráfico turquesa usa `--brand-strong`, y un texto, `--brand-text`.
- En oscuro los tres son el mismo `#12D4C4`, que sobre slate oscuro da 7 a 10:1.
- Texto sobre el degradado: siempre `--text-on-brand` (oscuro), en ambos modos. Nunca `--text-primary`, que en oscuro pasa a claro.
- Nunca texto con degradado: el énfasis se da con peso o tamaño.
- El degradado no cambia con el tema. En oscuro solo cambia la sombra de lo que flota con él: la sombra turquesa (`--shadow-brand`) se vería como un halo sobre fondo oscuro, y pasa a una neutra.

### Personas del hogar

| Token | Valor (fijo) | Uso |
|---|---|---|
| `--person-a` | `--gradient-brand` | Quien se registró primero (en la práctica, quien creó el hogar) |
| `--person-b` | `#818CF8` | La otra persona |

- Avatar: círculo con las iniciales en `--text-2xs`, bold, `--text-on-brand` (9.6 y 6.0:1). **Siempre dos letras**, para distinguir a dos personas con la misma inicial: nombre y apellido ("Mery Farías" → MF), o las dos primeras letras si solo hay un nombre ("Mery" → ME). El registro pide "Nombre y apellido". Lleva un anillo de 2px del color de la superficie donde está, para que dos avatares solapados se separen: sobre la cabecera, `#0F172A`; sobre una tarjeta de tono, `--avatar-ring` (blanco al 70% en claro, `--surface-card` en oscuro, donde el blanco pesaba sobre el vidrio).
- El orden sale de la fecha de registro (`useHouseholdMembers` los ordena), así cada persona tiene el mismo color para los dos.
- Tamaños: 24px en la cabecera, 25px en la historia oscura y 28px en las tarjetas. Solapados −8px (24) o −10px (28).
- Una cuenta de una persona muestra su avatar; una compartida, los dos solapados.
- En una cuenta individual (hogar de una persona) se muestra solo `--person-a`.

### Logo

Isotipo y "Twoney" en un solo SVG, con un color: `currentColor` (`--text-primary`), así funciona en ambos modos. El SVG del prototipo tiene trazos grises de 0.25px, que son restos del vectorizado y se eliminan. En el encabezado del onboarding va a 99×23px. Lleva `role="img"` y `aria-label="Twoney"`.

### Fondos con manchas

El onboarding y las historias 1 y 3 del Resumen comparten este fondo: `--gradient-page` con dos manchas difuminadas. El login tiene su propia versión, más intensa y con vidrio (ver "Fondo — pantallas de autenticación").
- **Mancha turquesa** `rgba(18,212,196,0.10)`: 220px, arriba a la izquierda, sobresaliendo (−70px, −60px).
- **Mancha índigo** `rgba(129,140,248,0.10)`: 210px, abajo a la derecha (−50px, −50px).
- En oscuro las dos suben al 14%.
- Se dibujan con `radial-gradient`, no con `filter: blur(60px)`, que cuesta en móviles y se ve igual.
- Son decorativas: no llevan contraste y el texto se mide contra `--gradient-page`, sin ellas.

## Colores — datos

### Tonos de tarjeta

Seis tonos para tarjetas de patrimonio y categorías. El texto encima es siempre `--text-primary` y `--text-secondary`, nunca un color propio del tono.

| Tono | Claro (fondo sólido) | Base en oscuro |
|---|---|---|
| `turquesa` | `#A7E8DC` | `#12D4C4` |
| `lavanda` | `#D7D3FB` | `#818CF8` |
| `pizarra` | `#D9DEE7` | `#94A3B8` |
| `celeste` | `#BFE3F9` | `#38BDF8` |
| `ambar` | `#FDE68A` | `#F59E0B` |
| `rosa` | `#FBCFE8` | `#F472B6` |

- **Claro:** fondo sólido, sin borde, con `--shadow-card`. Texto primario, 12.4 a 14.3:1; secundario, 5.3 a 6.1:1.
- **Oscuro:** en vez de un pastel, el tono se mezcla con la tarjeta, lo que da un acabado de vidrio tintado. El fondo es `linear-gradient(160deg, rgba(base, 0.22), rgba(base, 0.10)), var(--surface-card)`, con borde 1px `rgba(base, 0.35)` y sin sombra.
  - La capa de `--surface-card` debajo hace la tarjeta **opaca**. Hace falta porque las tarjetas se apilan al hacer scroll, y con transparencia real se vería el contenido de la de abajo.
  - Texto primario, 9.6 a 13.3:1; secundario, 5.7 a 7.9:1.
- Tokens: `--tone-<nombre>-bg` (en claro, un color; en oscuro, el `background` completo) y `--tone-<nombre>-border` (en claro, `transparent`).

**Asignación:**
- Cuentas: `a` turquesa, `b` lavanda.
- Deudas: `a` pizarra, `b` celeste.
- Cada cuenta o deuda nueva rota entre sus variantes. Si hacen falta más de dos, se toman de los tonos que quedan libres.
- Inversiones: van en lista agrupada, no en tarjeta. La variante del grupo pinta el cuadro de su ícono:
  - `a` ámbar: claro `#FEF3C7` con ícono `#B45309` (4.5:1); oscuro `rgba(245,158,11,0.16)` con `#FBBF24` (7.6:1).
  - `b` lavanda: claro `#E0E7FF` con `#4F46E5` (5.1:1); oscuro `rgba(129,140,248,0.16)` con `#A5B4FC` (6.6:1).
- Categorías: las claves guardadas en la base se mantienen y cambian de tono y de nombre visible: `green` → Turquesa, `purple` → Lavanda, `coral` → Ámbar, `pink` → Rosa.

### Ganancia, pérdida y series

Cada color de estado tiene dos usos con requisitos distintos: como relleno o gráfico basta 3:1; como texto hace falta 4.5:1. Por eso hay tokens separados.

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--gain-text` | `--brand-text` | `--brand-text` | Montos positivos, variación positiva |
| `--loss-text` | `#C61469` | `#F472B6` | Montos negativos, mensajes de error (5.2–5.7 / 5.7–7.1:1) |
| `--gain-color` | `--brand-strong` | `#12D4C4` | Ingresos y cuentas en gráficos |
| `--loss-color` | `#C61469` | `#EC4899` | Gastos y deudas en gráficos (4.3–5.3:1 en oscuro) |
| `--series-indigo` | `#6366F1` | `#818CF8` | Segunda serie: persona b, inversiones, gasto del presupuesto (4.1–4.5 / 5.1–6.3:1) |
| `--series-indigo-text` | `#4F46E5` | `#A5B4FC` | Texto índigo |
| `--series-pink` | `#DB2777` | `#F472B6` | Tercera serie (metas) |
| `--danger-bg` | `#C61469` | igual | Fondo de botones destructivos |
| `--danger-bg-hover` | `#A3105A` | igual | Hover destructivo (7.6:1: el hover sube el contraste) |
| `--text-on-danger` | `#FFFFFF` | igual | Texto sobre `--danger-bg` (5.7:1) |

- La ganancia es turquesa y la pérdida magenta, no verde y rojo: se distinguen también por luminosidad, así que sirven para quien no distingue rojo de verde. Aun así, el signo (`+`/`-`) va siempre en el texto.
- Sobre la cabecera, las series usan sus versiones claras: cuentas `--brand` (9.6:1), inversiones `#818CF8` (6.0:1), deudas `#F472B6` (6.7:1).
- `--text-on-danger` es blanco fijo en ambos modos.
- **El contraste se mide en todos los estados**, no solo en reposo: hover, foco y seleccionado también tienen que llegar a su mínimo. Solo el estado deshabilitado está exento.

## Espaciado, bordes y elevación

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--gutter: 20px;          /* margen lateral de las pantallas de la app; el onboarding usa --space-lg */

--radius-control: 8px;   /* botones, inputs, opciones */
--radius-card: 8px;      /* tarjetas, hojas (solo esquinas superiores), diálogos, selector de hogar */
--radius-bar: 12px;      /* barras gruesas de las historias */
--radius-full: 999px;    /* píldoras, avatares, barras finas, botones de solo ícono, botón flotante */

--shadow-card:       0 4px 14px rgba(15, 23, 42, 0.08);   /* tarjetas de patrimonio, solo en claro */
--shadow-card-hover: 0 6px 16px rgba(15, 23, 42, 0.09);
--shadow-md:         0 2px 12px rgba(15, 23, 42, 0.08);   /* hojas y diálogos; en oscuro, 0 4px 16px rgba(0, 0, 0, 0.5) */
--shadow-brand:      0 10px 22px rgba(18, 212, 196, 0.4); /* botón flotante; en oscuro, 0 4px 16px rgba(0, 0, 0, 0.5) */
```

- **Todo lleva radio de 8px** (decidido el 2026-09-28), incluidas las hojas y el diálogo. Las formas redondas son solo para lo pequeño o circular: píldoras, avatares, barras finas, botones de ícono y botón flotante.
- Los valores del prototipo que no están en la escala (14, 18, 22, 26, 30px) se llevan al token más cercano.
- **Una sola elevación por superficie:** borde o sombra, no ambos. Un borde de 1px bajo una sombra difusa se lee como una tarjeta fantasma. Según la superficie:
  - **Tarjetas neutras** (login, lista de inversiones, formularios): borde `--border`.
  - **Tarjetas de patrimonio:** en claro, sombra (el tono ya las separa del fondo); en oscuro, el borde de su tono, porque una sombra sobre fondo oscuro no se ve.
  - **Lo que flota** (hoja, diálogo, botón flotante): sombra.
  - **Tarjetas de vidrio** de la historia 1: solo borde. El prototipo sumaba sombra, y se quitó.
- **Nada de tarjetas dentro de tarjetas.** Si algo necesita separarse dentro de una tarjeta, se usa espacio o un divisor. Ejemplo: el QR de invitación lleva su margen blanco dentro de la propia imagen (zona de silencio de 4 módulos, la que pide la especificación), en vez de una caja con borde alrededor.
- Layout: `--container-max` 1120px, `--header-height` 64px.

## Botones

| Variante | Fondo | Texto | Borde | Hover |
|---|---|---|---|---|
| Primario | `--gradient-brand` | `--text-on-brand` | — | Capa blanca al 16% |
| Secundario | `--surface-card` | `--text-primary` | 1px `--border-strong` | `--surface-sunken` |
| Destructivo | `--danger-bg` | `--text-on-danger` | — | `--danger-bg-hover` |
| Contorno sobre oscuro | transparente | `--text-on-header` | 1.5px `rgba(255,255,255,0.55)` (5.8:1) | `rgba(255,255,255,0.08)` |
| Deshabilitado | `--surface-sunken` | `--text-disabled` | — | — |

**Hover = cambio de color de fondo, nunca de opacidad.** Bajar la opacidad casi no se nota en un botón oscuro, y en uno de color aclara el fondo y baja el contraste del texto. El primario es la excepción de técnica: un degradado no transiciona de color, así que el hover es una sombra interna blanca al 16% (`inset 0 0 0 100px`), que se pinta sobre el fondo y debajo del texto y sí se puede animar. Aclara en vez de oscurecer porque el texto es oscuro, y así sube el contraste (8.3 → 9.2:1). Cada color de hover se mide con su texto igual que el de reposo.

- **El primario es uno solo en toda la app:** el degradado de marca. El botón negro anterior desaparece.
- En los pasos de un flujo, el primario va a todo el ancho (unos 56px de alto, `--text-md` bold) y lleva una flecha a la derecha ("Continuar →"). En un formulario va sin flecha.
- **Deshabilitado:** fondo y texto propios, no `opacity: 0.6`. En un flujo por pasos, el botón deshabilitado dice qué falta a través de la ayuda del campo, no queda mudo.
- **Botón flotante:** círculo de 52px con `--gradient-brand`, ícono + de 20px en `--text-on-brand` y `--shadow-brand`. Va a `--gutter` del borde derecho y 16px sobre la barra inferior. Solo existe donde la pantalla tiene una acción de crear evidente ("Añadir movimiento" en Resumen, "Añadir cuenta, deuda o inversión" en Patrimonio), con ese `aria-label`.
- **Botones de solo ícono** (cambiar tema, cerrar, agregar a una sección): circulares (`--radius-full`), de 24 a 34px, con fondo `--surface-sunken` (o `--surface-on-header` sobre la cabecera).
- **Área táctil mínima de 44×44px** para todo control independiente: botones, opciones, toggles. Un botón de ícono puede verse de 24–32px; su zona de toque llega a 44px con un pseudo-elemento invisible (`::before` con `inset` negativo), sin cambiar cómo se ve. Las zonas de dos controles vecinos no se superponen: el espacio entre ellos tiene que ser al menos la suma de lo que cada uno se agranda.
- **Enlaces de texto** dentro de una fila o formulario (volver, copiar, editar, archivar): mínimo 24px de alto, el piso de WCAG 2.5.8. Lo asegura `button { min-height: 24px }` en `reset.css`; un enlace `<a>` suelto lo necesita en su propio módulo (ej. "¿Olvidaste tu contraseña?").
- **Enlaces de acción** ("Únete a una", "Escanear código QR"): `--brand-text`, bold. Subrayado si van dentro de una frase. Sin fondo ni radio; en hover se oscurecen.
- **Botón secundario: nunca relleno gris**, se confunde con un estado deshabilitado. `--surface-sunken` queda reservado para el feedback de hover.
- **Estados obligatorios:** default, hover, `:active` (escala, ver Transiciones), `:focus-visible` (anillo global de `reset.css`), deshabilitado y cargando (texto de acción en gerundio, ej. "Guardando…").

## Fondo — pantallas de autenticación (login, recuperar contraseña, crear cuenta)

**Glassmorfismo en aguamarina y morado** (decidido el 2026-09-28). Es el lugar de la app donde la marca se ve con más fuerza: la puerta de entrada. El fondo está dibujado en CSS. Reemplaza a las imágenes `login-background.webp` y `login-background-dark.webp`, que eran de la paleta anterior y se borran al migrar.

**Fondo:**
- Base: `--surface-page` en claro (`#F8FAFC`); azul marino `#0B1120` en oscuro.
- Tres manchas grandes y difuminadas (`radial-gradient`, no `filter: blur`):
  - Aguamarina `#12D4C4`, arriba a la izquierda.
  - Morado `#818CF8`, a la derecha, a media altura.
  - Cian `#10C2D8`, abajo a la izquierda.
- Intensidad en el centro de cada mancha: 45% en claro, 35% en oscuro. Son los mismos colores en los dos modos; solo cambia la base.

**Tarjeta de vidrio** (el formulario):
- Claro: `rgba(255, 255, 255, 0.72)` con borde 1px `rgba(255, 255, 255, 0.8)`.
- Oscuro: `rgba(15, 23, 42, 0.65)` con borde 1px `rgba(255, 255, 255, 0.12)`.
- `backdrop-filter: blur(24px) saturate(140%)`, radio `--radius-card` y sin sombra (una sola elevación: el borde).
- Sin soporte de `backdrop-filter`, la tarjeta cae a `--surface-card` sólido.

**Contraste medido en el peor caso** (el vidrio justo encima del centro de una mancha):
- Claro: texto primario 14.8:1 o más; secundario 6.3; muted 4.8; error (`--loss-text`) 5.0; borde de los campos 3.1.
- Oscuro: primario 12.3; secundario 7.3; muted 5.1; turquesa 7.7; error 5.1; borde 3.3.
- **Dentro de la tarjeta, los enlaces van en `--text-secondary`, no en `--brand-text`:** el turquesa da 4.4:1 sobre la mancha morada.
- Los campos tienen su propio fondo `--surface-card`, así que el texto que se escribe no depende del vidrio.

- `RippleBackground` sigue dibujando sus ondas al tocar, en `--brand` al 20%. Solo se dibujan mientras existen: el loop de animación arranca con el toque y se detiene cuando termina la última onda. Con reducir movimiento no se dibujan (se consulta en cada toque, así respeta el cambio aunque la pantalla ya esté abierta).
- Mismas reglas para las tres pantallas y para la 404, variando solo el contenido del formulario.

**Bienvenida (`Welcome`)**: mantiene la imagen de las ondas (`welcome-hero.webp`), pasada a la paleta nueva (decidido el 2026-09-28).
- Se recolorea con un mapa de degradado por luminosidad: las sombras a azul marino (`#0F172A`), los medios a morado (`#818CF8`) y las luces a aguamarina (`#12D4C4`). Conserva las ondas y la luz del original; solo cambian los colores.
- El color de respaldo pasa a ser el promedio de la imagen nueva.
- Los velos oscuros de arriba y de abajo, y el texto blanco, se mantienen.

**Formato de las imágenes:** WebP con calidad 90. Los fondos con grano fino pierden el grano con compresión más fuerte: con calidad 80 aparecen bloques; AVIF a 60–75 hace saltos de color en bloques. Al exportar una imagen nueva, se verifica un recorte ampliado con el contraste estirado contra el original antes de reemplazarla. Los originales en PNG están en el historial de git.

## Rendimiento

- **Una librería pesada que solo usa una pantalla o una acción se carga bajo demanda**, no en la carga inicial: por ejemplo, la librería de QR con `import()` dentro de `InviteQrCode`. Un `Suspense` reserva la altura del contenido que falta, para que la página no salte cuando llega. Los gráficos son SVG propios y no necesitan librería.
- **Actualización de la PWA:** el service worker se registra con `registerSW({ immediate: true })` de `virtual:pwa-register` en `main.tsx`, no con el script que el plugin inyecta por defecto. Así la página se recarga sola cuando se activa una versión nueva. Con el script inyectado, la primera carga después de cada despliegue mostraba la versión anterior, y los assets que ya no existían en el servidor salían rotos.
- **Toda pantalla con imagen de fondo tiene un color de respaldo** (el promedio de la imagen) para mientras carga o si falla, en vez de dejar ver el fondo de la página.
- **Efectos caros:** las manchas del fondo van con `radial-gradient`, no con `filter: blur()`. `backdrop-filter` solo en las dos tarjetas de vidrio de la historia 1, no en listas ni en nada que haga scroll.
- **Carga por ruta:** cada pantalla es un fragmento aparte (`lazy` en `App.tsx`); solo la bienvenida y el login van en la carga inicial. Una pantalla nueva se agrega con el mismo `page(...)`.
- **Datos compartidos:** el hogar, las cuentas, las categorías y los miembros se guardan una vez para toda la app (`createSharedQuery` en `lib/sharedQuery.ts`) y se vuelven a pedir solo si tienen más de 30 segundos o después de guardar. Se borran al cambiar de usuario. Quien guarda un movimiento recarga también las cuentas, porque la base actualiza los saldos.
- **Nunca una consulta sin tope:** la API de Supabase corta en 1000 filas sin avisar. Las listas se piden por páginas (Movimientos: 50 y "Cargar más"; el resumen, 5); lo que se suma completo (gráficos, presupuestos) se pide en bloques de 1000 hasta el final (`listTransactions`).
- **Precache de la PWA** (`vite.config.ts`): todo lo que la app necesita sin conexión (JS, CSS, imágenes WebP, fuentes) y nada más. Los archivos de `public/` que la app no usa van a `globIgnores`. El límite de tamaño por archivo es el de Workbox (2 MiB); si algo lo supera, se optimiza el archivo en vez de subir el límite.

## Montos y moneda

- **La moneda es del hogar**, no fija en el código: se elige en el onboarding y se guarda en `households.currency`. Monedas disponibles: CLP, USD, EUR, MXN, COP, ARS, PEN. El prototipo mostraba EUR, USD y GBP como ejemplo; la lista es esta.
- Todo monto visible pasa por `formatCurrency(amount, currency)` (`src/lib/format.ts`), con la moneda que entrega `useCurrency()`. Nunca escribir un símbolo ni un código de moneda a mano. El prototipo escribía "2.200 €"; en la app es `€2.200`.
- **Se muestra el símbolo, no el código:** `€1.234`, `S/ 1.234`, `$1.234`. Los soles llevan un espacio después del símbolo, que pone `Intl` y es la forma habitual en Perú. Los símbolos están en un mapa explícito en `format.ts`, porque `Intl` con el locale `es-CL` muestra código para las monedas no locales y no trae `S/` para PEN. Para agregar una moneda, se suma al mapa: el selector del onboarding se arma desde ahí.
- Varias monedas comparten el símbolo `$`. Dentro de un hogar no confunde, porque hay una sola moneda. Si alguna pantalla llega a mostrar montos de monedas distintas, ahí hay que volver a mostrar el código. El selector de moneda muestra símbolo y código juntos por esto mismo.
- Formato: locale `es-CL`, clase `.amount` para cifras tabulares.
- **Decimales según la moneda:** los montos se guardan en unidades de la moneda con hasta 2 decimales (`numeric(14, 2)`), no en la unidad menor. CLP y COP se escriben y muestran sin decimales (`$1.234`); USD, EUR, MXN, ARS y PEN siempre con dos (`€12,50`, `€1.234,00`). El mapa está en `format.ts` (`getCurrencyDecimals`); una moneda nueva se agrega ahí. El formato compacto (`$3 M`) va siempre sin decimales.
- **El signo va antes del símbolo**: `-$23.990`, `+$850.000`. Intl con `es-CL` lo pone después (`$-23.990`), y junto al `+` de los ingresos no se leían parejos. Lo resuelve `formatCurrency`: los negativos siempre llevan `-`; el `+` solo con `{ signed: true }`, en listas de movimientos y en el balance del Resumen, donde importa distinguir ingreso de gasto. El cero no lleva signo. Nunca se antepone un signo a mano.
- Los inputs de monto (`NumberField`) anteponen el símbolo de la moneda del hogar y aceptan sus decimales. Se escriben en formato es-CL: coma decimal y punto de miles (`1.234,50`). Como en muchos teclados el decimal es un punto, un solo punto seguido de 1 o 2 dígitos también cuenta como decimal (`12.5`), mientras que `1.234` sigue siendo mil doscientos treinta y cuatro. El teclado del celular muestra la coma solo en monedas con decimales. Antes el campo borraba la coma y `12,50` se guardaba como `1250`.

## Estructura de la app

**Navegación inferior:** cinco pestañas, en este orden.

| Pestaña | Ruta | Ícono | Contenido |
|---|---|---|---|
| Resumen | `/resumen` | Casa | Las historias del mes |
| Patrimonio | `/patrimonio` | Barras | Cuentas, deudas e inversiones, con el total |
| Presupuesto | `/presupuesto` | Tarjeta | Presupuestos por categoría |
| Movimientos | `/movimientos` | Flechas (`SwapIcon`) | Lista de movimientos |
| Ver más | `/mas` | Cuatro puntos en cuadrícula | Categorías (`/categorias`), ajustes del hogar (`/ajustes`), invitar a tu pareja (`/invitar`) |

- **Inicio:** `/resumen`. Es adonde lleva todo lo que antes iba a `/dashboard`: después del login (también el de Google y Apple), de unirse a un hogar, de restablecer la contraseña y la bienvenida.
- **Rutas viejas:** redirigen, para no romper links guardados. `/dashboard` → `/resumen`, `/mover` → `/movimientos`, `/estadisticas` → `/resumen`.
- Estadísticas deja de existir como pestaña: su contenido es el Resumen.
- **Pestaña activa:** ícono en `--brand-strong`, etiqueta en `--text-primary` bold y un punto de 4px en `--brand-strong` debajo. Además del color, la marca el punto.
- **Inactiva:** ícono y etiqueta en `--text-muted`, medium (5.4:1 en claro, 5.9:1 en oscuro).
- Etiquetas en `--text-2xs`. Fondo `--surface-card` con borde superior `--border`.
- En escritorio las mismas cinco van en el encabezado.

**Cabecera de la app:** bloque `--surface-header` (fijo en ambos modos) arriba de las cinco pestañas, con dos círculos blancos al 7% que se cruzan en la esquina derecha, como decoración.
- A la izquierda va el **título de la vista**: una píldora `--surface-on-header` con radio `--radius-card`, los avatares del hogar y el nombre ("Nuestro resumen", "Nuestro patrimonio"; "Mi…" en un hogar de una persona). **Por ahora es solo un título** (decidido el 2026-09-28): sin chevron, y no es un botón. El prototipo tenía un chevron que sugería un menú para ver el resumen de una sola persona; ese filtro queda para después.
- A la derecha va el **cambio de tema**: botón circular de 34px (44 de zona táctil). Es el toggle de modo oscuro, que tiene que estar a mano desde la pantalla principal.
- **Resumen** agrega debajo el navegador de mes: "SEPTIEMBRE 2026" en `--text-xs` bold con `--tracking-label`, entre dos flechas (`aria-label` "Mes anterior" / "Mes siguiente") en `--text-on-header-muted`.
- **Patrimonio** agrega el total y la barra de composición (ver Componentes).
- Sobre la cabecera, el anillo de foco es blanco: el `--text-primary` del modo claro sería invisible.

## Onboarding

Un flujo por pasos, con el fondo de manchas y sin hoja inferior ni encabezado de color.

**Estructura de cada paso:**
- **Encabezado:** "Volver" a la izquierda (chevron de 20px en `--text-secondary`, 44px de zona táctil; no aparece en el primer paso ni en el final), el logo centrado y, debajo, la barra de progreso. Margen superior de 52px.
- **Barra de progreso:** línea de 2px en `--border` con un punto de 8px en `--brand-strong` que avanza de paso en paso. Es un `role="progressbar"` con `aria-valuetext` "Paso 2 de 3". Mismo patrón para cualquier flujo de varios pasos.
- **Número del paso** ("01", "02"): arriba a la derecha, detrás del título, en `--text-watermark` light, color `--surface-sunken`. Es decorativo (`aria-hidden`); el número real lo anuncia la barra.
- **Título:** `<h1>` en `--text-3xl` bold, con una ayuda debajo en `--text-sm` `--text-secondary`, ambos con ancho máximo de unos 270px.
- **Pie:** el CTA primario a todo el ancho, con 34px de margen inferior.

**Recorridos:**
- **Solo yo:** tipo y nombre → moneda → final.
- **Crear en pareja:** tipo y nombre → invitación → moneda y reparto → final.
- **Unirse:** tipo de cuenta → código → final. Se llega desde el enlace "¿Ya tienes pareja? Únete a una".
- La barra se calcula sobre el recorrido elegido.
- **El hogar se crea al salir del paso 1** (decidido el 2026-09-28). Así, el código que muestra la invitación ya existe: nadie puede unirse a un hogar que todavía no está creado.

**Pasos:**

1. **Tipo y nombre** ("¿Cómo vas a usar Twoney?"):
   - Dos filas de opción a todo el ancho (ver "Filas de opción"), "Solo yo" y "Crear en pareja", cada una con su ilustración de 72px.
   - Debajo, el campo subrayado "Ponle nombre a tu hogar" (ver Campos), con el ejemplo "Ej. Casa Feliz".
   - Al final, el enlace para unirse.
   - "Continuar" se habilita con una opción elegida y un nombre escrito, y crea el hogar.
2. **Invitación**, solo en pareja ("Invita a tu pareja", con la ayuda "Puede sumarse cuando quiera con este código"): el bloque de invitación. Invitar es opcional: "Continuar" sigue igual.
3. **Código** ("Ingresa el código"): campo de código, con la ayuda "¿No tienes código? Pídeselo a quien creó el hogar."
   - **Sin escáner dentro de la app** (decidido el 2026-09-28). El QR de la invitación es un link a `/unirse/<id>`, así que se abre con la cámara del teléfono.
4. **Moneda y reparto** ("Moneda y gastos"; en un hogar de una persona, solo "Moneda"): selector de moneda y, en pareja, "¿Cómo prefieren repartir los gastos compartidos?" con tres tarjetas de opción: Proporcional, Indiferente y 50 / 50.
   - El reparto define cómo se divide el total de gastos compartidos del mes (ver Resumen, historia 2). Se puede cambiar después en Ajustes del hogar.
5. **Final** ("Todo listo"; al unirse, "¡Ya eres parte del hogar!"):
   - Ilustración de la casa y la moneda, con confeti alrededor.
   - Título centrado, y debajo una línea que nombra el hogar: «Casa Feliz» ya está configurado.
   - Tres filas de lo que se puede hacer: burbuja de 40px en `--brand-tint` con ícono de 18px en `--brand-strong` y texto `--text-sm` `--text-secondary`. El texto concuerda en número: "Registren…" en pareja, "Registra…" solo.
   - CTA "Ir a mi hogar".

- **CTA por paso:** "Continuar" (tipo y nombre, invitación), "Unirme" (código), "Empezar" (moneda) e "Ir a mi hogar" (final).
- **Bloque de invitación:** caja con borde 1.5px `--border-strong` y 16px de relleno. Dentro:
  - El código en `--font-mono`, `--text-sm`, y puede ocupar dos líneas. Es el UUID del hogar (36 caracteres): el prototipo mostraba un código corto ("TWNY-4XQ9") en `--text-xl`, que la app no tiene.
  - Tres acciones apiladas que llenan el alto disponible, cada una con ícono de 20px y texto `--text-sm` medium, borde `--border` y radio 8px: "Copiar" (pasa a "Copiado" con un check durante 1.6 s y lo anuncia un `aria-live`), "WhatsApp" (comparte con `wa.me`; el ícono es un globo de chat propio, no el logo) y "Ver QR" (abre el QR en un diálogo).

## Pantallas principales

### Resumen

Las historias del mes, a pantalla completa entre la cabecera y la barra inferior. Se avanza tocando la historia.
- **Hogar de pareja:** tres historias (Ingresos vs. gastos, Gastos compartidos, Presupuestos).
- **Hogar de una persona, o de pareja con reparto "Indiferente":** dos, sin Gastos compartidos. Si no se comparten cuentas, o si todo se maneja en conjunto sin dividir, no hay nada que consolidar. El prototipo mostraba esta historia también en un hogar individual; era un error.
- **Metas** será la cuarta cuando exista su módulo (decidido el 2026-09-28: espera). Su diseño queda definido abajo.

- **Indicador:** un segmento de 4px por historia, arriba, con separación de 6px. Los cumplidos van en el color de texto de la historia; los pendientes, en ese mismo color al 18–25%. Es decorativo (`aria-hidden`), porque la posición se anuncia con el título.
- **Número de la historia** ("01", "02"…): marca de agua en `--text-watermark` light, al 5–8%.
- **Título:** `<h2>` en `--text-2xl` bold, con una ayuda debajo en `--text-sm` `--text-secondary`.
- **Accesibilidad:** la historia avanza con un `<button>` real que cubre el área, con `aria-label` "Siguiente: Gastos compartidos". Las flechas del teclado avanzan y retroceden. El título de la historia nueva se anuncia con `aria-live="polite"`. Los botones dentro de una historia (como "Saldar") no la avanzan.

| # | Historia | Fondo claro | Fondo oscuro |
|---|---|---|---|
| 1 | Ingresos vs. gastos | Fondo con manchas | Fondo con manchas |
| 2 | Gastos compartidos | `linear-gradient(160deg, #1E1B3A, #0F172A)`, **igual en ambos modos** | igual |
| 3 | Presupuestos | Fondo con manchas | Fondo con manchas |
| 4 | Metas (pendiente) | `linear-gradient(135deg, #DBEAFE, #FCE7F3)` | `linear-gradient(135deg, #16223F, #2A1530)` |

1. **Ingresos vs. gastos:**
   - Anillo de 210px con trazo de 14px: el arco de ingresos en `--gain-color` sobre el de gastos en `--loss-color`.
   - Al centro, "BALANCE" como etiqueta y el balance en `--text-4xl` medium, en `--gain-text` o `--loss-text` según el signo.
   - Abajo, dos tarjetas de vidrio: Ingresos y Gastos, cada una con un punto de su color, el monto en `--text-xl` bold y una línea secundaria en su color de texto.
   - Vidrio en claro: `rgba(255,255,255,0.55)` con `backdrop-filter: blur(14px)` y borde 1px `rgba(255,255,255,0.7)`. En oscuro: blanco al 6% con borde blanco al 10%.
2. **Gastos compartidos** (oscura siempre):
   - Semicírculo con dos arcos, uno por persona (`--brand` e índigo `#818CF8`), según cuánto le toca a cada uno.
   - Debajo, "POR SALDAR", el monto en `--text-4xl` bold blanco y "Mayk le debe a Mery".
   - Una tarjeta por persona (blanco al 6%): avatar de 25px, nombre, píldora de porcentaje, "Le tocaba" y "Pagó".
   - Botón de contorno "Saldar".
   - Todo el texto de apoyo en `--text-on-header-muted`.

   **Cómo se calcula** (decidido el 2026-09-28):
   - **Gastos compartidos del mes:** los movimientos de gasto sin titular ("de ambos"). Los que tienen titular son individuales y no entran.
   - **Quién pagó:** el dueño de la cuenta de donde salió el dinero. Si salió de una cuenta compartida, lo pagaron los dos en su proporción, y no genera saldo.
   - **Cuánto le toca a cada uno**, según el reparto elegido en el onboarding (se cambia en Ajustes del hogar):
     - **50 / 50:** la mitad cada uno.
     - **Proporcional:** en proporción a los ingresos del mes de cada uno (los movimientos de ingreso con su titular). Si alguno no registró ingresos ese mes, se reparte 50 / 50 y la historia lo dice.
     - **Indiferente:** todo se maneja en conjunto y no se divide, así que esta historia no aparece.
   - **Por saldar:** lo que pagó cada uno menos lo que le tocaba. Quien pagó de menos le debe la diferencia a quien pagó de más. Sin diferencia, la historia dice "Están a mano" y no muestra "Saldar".
   - **"Saldar"** registra que quien debe le transfirió a la otra persona el monto pendiente. La transferencia real se hace en el banco; la app la anota para que los saldos de las cuentas sigan siendo correctos, y el mes queda "Saldado". El modelo de datos está en el README (R7).
3. **Presupuestos:** tres barras de 36px con radio `--radius-bar` sobre un riel `--border` en claro, `#243047` en oscuro.
   - Gasto en `--series-indigo`, Inversión en `--gain-color` y Deuda en `--text-primary` (3.2 a 14.5:1 contra el riel).
   - Cada barra lleva encima el nombre (`--text-lg` bold) con el porcentaje, y debajo los montos ("Gastado", "Disponible") en `--text-sm`.
   - Una deuda saldada muestra un check y "Saldada".
   - **Mientras no existan los presupuestos de Inversión y Deuda** (esperan, decidido el 2026-09-28): la primera barra es "Gasto" (el total de los presupuestos de gasto del mes) y las otras dos son las dos categorías con presupuesto más cerca de su límite, con su nombre. Cuando exista el módulo, esas dos pasan a ser Inversión y Deuda. Sin presupuestos creados, la historia muestra su estado vacío con "Crear el primero".
4. **Metas** (pendiente, espera a su módulo): cuadrícula de 2 columnas con frascos de 80×107px. El líquido sube hasta el porcentaje, en `--gain-color`, `--series-indigo` y `--series-pink`.
   - Encima de cada frasco, la píldora de porcentaje; debajo, el nombre (`--text-sm` bold) y "480 € / 1.000 €" en `--text-xs`.
   - El último lugar es "Nueva meta", un botón con borde punteado (decorativo), ícono + y texto.

### Patrimonio

- **Cabecera:** el total del patrimonio (cuentas + inversiones − deudas) en `--text-4xl` bold blanco. Debajo, la **barra de composición**:
  - 7px de alto, riel blanco al 14% y un segmento por grupo en las series de la cabecera, con 2px de separación entre segmentos.
  - Es un botón ("Ver composición del patrimonio") que abre la hoja de composición. Tocar un segmento abre la hoja con ese grupo destacado.
  - Debajo de la barra, un chevron de pista.
- **Secciones:** Cuentas y Deudas con tarjetas; Inversiones en lista.
- **Efecto de apilado al hacer scroll** en Cuentas y Deudas:
  - El título de la sección y la primera tarjeta quedan fijos 150px de scroll mientras la segunda sube y la tapa, hasta dejar asomar 18px de la de abajo. Después, el grupo entero sigue con el scroll.
  - Se hace con `transform` calculado en el evento de scroll (pasivo), no con `position: sticky`, para que el título y sus tarjetas se suelten a la vez.
  - Con reducir movimiento no hay apilado: las tarjetas van en flujo normal.
  - Con teclado, la tarjeta enfocada se muestra completa (`scroll-margin`).
- **Hoja de composición:** una hoja inferior (ver Diálogo) titulada "Composición del patrimonio", con una fila por grupo:
  - Borde izquierdo de 4px en el color de la serie.
  - Etiqueta en mayúsculas (`--text-2xs` `--text-muted`) y píldora con el porcentaje.
  - Monto en `--text-2xl` bold y barra de 5px sobre `--surface-sunken`. En esta hoja las series van en sus colores de superficie clara u oscura, no en los de la cabecera.
  - La fila destacada toma fondo `--surface-sunken` y escala 1.02. Las demás **no se atenúan con opacidad**: el prototipo las bajaba al 50%, y su texto quedaba bajo 4.5:1.

## Componentes clave

**Tarjeta de cuenta y de deuda**
- Fondo del tono asignado (ver "Tonos de tarjeta"), radio `--radius-card`, 24px de relleno.
- **Arriba:** ícono de 28px y nombre en `--text-lg` regular a la izquierda; a la derecha, los avatares de 28px (uno si es de una persona, los dos si es compartida).
- **Estrella de cuenta principal:** después del nombre, 13px rellena, `#B45309` en claro (3.5–3.6:1) y `#FBBF24` en oscuro (6.3–7.1:1). Hay una cuenta principal por hogar, que se elige en el formulario de la cuenta (se agrega al modelo en R6).
- **Monto:** abajo a la derecha, en `--text-4xl` bold con `--tracking-amount`. 40px de separación entre la fila de arriba y el monto en cuentas; 22px en deudas, que además llevan la barra.
- **Deudas:** barra de progreso de 6px y, debajo a la derecha, "cuota · N pagos" en `--text-sm` `--text-secondary`.
- Es un `<button>` (abre la edición), con un `aria-label` armado a mano: "Banesco, $1.284.500, de Mariana", "Crédito auto, $5.400.000, 40 % pagado, compartida". El nombre que saldría del contenido juntaría los textos sin separar y perdería al dueño, que solo se ve como iniciales. "Compartida" concuerda con cuenta, deuda e inversión.
- **Hover** (solo puntero fino): sube `--hover-lift` y pasa a `--shadow-card-hover`.

**Encabezado de sección (Cuentas / Deudas / Inversiones)**
- `<h2>` en `--text-xl` bold a la izquierda. A la derecha, el total en `--text-md` bold `--text-primary` y un botón circular + de 24px ("Añadir cuenta").
- Debajo, un divisor `--border`.
- **Las secciones no se pliegan** (decidido el 2026-09-28): no hay chevron ni `aria-expanded`.
- Cuentas y Deudas comparten el componente de sección con su configuración (textos, monto, ícono por defecto); un cambio de comportamiento se hace ahí, una vez.

**Lista de inversiones** (agrupada; los grupos se agregan al modelo en R6)
- Un contenedor por grupo: `--surface-card` con borde `--border` y radio `--radius-card`.
- **Encabezado del grupo:** cuadro de 28px con el ícono, en la variante del grupo, el nombre (`--text-sm` bold) y un botón + circular a la derecha ("Añadir a De giro"). Debajo, un divisor.
- **Una fila por inversión,** separadas por un divisor:
  - A la izquierda, el nombre (`--text-sm` medium) y debajo la fecha o la cantidad (`--text-xs` `--text-muted`).
  - A la derecha, el valor (`--text-sm` bold) y debajo la variación con signo (`--text-xs` bold, `--gain-text` o `--loss-text`).
- Las inversiones sin grupo van al final, en un contenedor "Otras" sin cuadro de ícono.

**Barra de progreso (deudas, presupuestos)**
- **Deudas:** 6px sobre la tarjeta de color. Claro: riel `rgba(255,255,255,0.55)` y relleno `rgba(15,23,42,0.7)`. Oscuro: riel `rgba(255,255,255,0.12)` y relleno `rgba(241,245,249,0.8)`. Da 5 a 6.4:1 entre relleno y riel.
- **Presupuestos:** 5px, riel `--surface-sunken`. El relleno avisa en tres pasos:
  - **Gasto:** `--gain-color` hasta el 80%, `--text-primary` entre el 80% y el 100% (aviso) y `--loss-color` al pasarse.
  - **Ingreso** (una meta a alcanzar): `--text-primary` hasta llegar y `--gain-color` al llegar.
  - En las historias se usan las barras gruesas del Resumen.
- Radio `--radius-full`.
- Es un `<span>` con `display: block`, no un `<div>`: va dentro de la tarjeta, que es un botón, y un botón solo admite contenido en línea.
- Largo proporcional a lo pagado o gastado. El relleno mide siempre el 100% del riel y se desplaza con `transform: translateX(-(1 − proporción) × 100%)`; el riel (`overflow: hidden`) recorta lo que sobra. Nunca animar `width` (recalcula layout). Tampoco `scaleX` en una barra que cambia de valor: aplasta el extremo redondeado. La única excepción es la entrada de las barras gruesas del Resumen (ver Transiciones).

**Píldora de porcentaje**
- `--text-xs` bold, relleno 2–3px × 8–10px, `--radius-full`.
- **Fondo:** el color de su serie al 14–18% sobre la superficie donde está, o `--surface-sunken` si no tiene serie.
- **Texto:** siempre el texto de esa superficie (`--text-primary`, o blanco sobre la historia oscura), no el color de la serie. En color, sobre los fondos pastel de la historia de Metas no llegaba a 4.5:1.

**Diálogo**
- En móvil es una hoja inferior (bottom sheet): radio `--radius-card` en las esquinas de arriba, un tirador de 36×4px en `--border-strong` y `--shadow-md`. Desde 640px, un diálogo centrado con radio `--radius-card`. Detrás, `--scrim`.
- Al abrir con teclado o mouse, el foco va al primer campo del contenido, no al botón de cerrar. En pantallas táctiles (`pointer: coarse`) va al panel: enfocar un input abriría el teclado encima de la hoja apenas aparece.
- Mientras está abierto, Tab y Shift+Tab no salen del diálogo: desde un extremo saltan al otro. Al cerrar, el foco vuelve al elemento que lo abrió. Escape cierra, y tocar el velo también.
- El efecto que maneja el foco depende solo de `open`. `onClose` se lee desde una ref: como suele ser una función nueva en cada render del padre, si fuera dependencia el efecto se reiniciaría y le quitaría el foco al campo en el que se está escribiendo.
- Entra deslizándose desde abajo (hoja) o con fundido y escala desde 0.97 (centrado), con `@starting-style` y `--duration-base`. Sale con `--duration-fast`: más rápido que la entrada. La hoja de composición es un diálogo más y sigue estas reglas: el prototipo la hacía entrar en 380ms.
- Al cerrar, sigue montado `EXIT_MS` (150ms, igual a `--duration-fast`) mostrando el último contenido que tuvo abierto. Así la animación de salida tiene qué animar aunque el padre ya haya puesto su estado en `null`, y el foco vuelve al disparador mientras el campo enfocado todavía existe. Si el diálogo desapareciera primero, el foco pasaría por `<body>` y Chrome no mostraría el anillo al devolverlo: el foco volvía, pero invisible.

**Campos**
- **Estándar:** borde 1.5px `--border-control`, radio `--radius-control`, fondo `--surface-card`, texto `--text-md`. Con foco, el borde pasa a `--brand-strong` y aparece el anillo de foco.
- **Subrayado** (nombre del hogar): solo línea inferior de 1.5px en `--border-control`, sin caja, texto `--text-xl` medium. Con foco, la línea pasa a 2px `--brand-strong`. Es para un campo único y protagonista de un paso; en un formulario va el estándar.
- **Código** (unirse): campo estándar con `--font-mono`, `--text-md` y centrado. El código es el UUID del hogar (36 caracteres), así que a más tamaño no cabe en un teléfono; el prototipo usaba `--text-2xl` para un código corto que la app no tiene.
- Placeholders en `--text-muted`. Todo campo tiene su `<label>`: en el campo subrayado, el título del paso hace de etiqueta (`aria-labelledby`).

**Selector de moneda**
- Un `radiogroup` con las siete monedas en una cuadrícula de 4 columnas (dos filas).
- Cada opción muestra el símbolo en `--text-xl` bold y debajo el código en `--text-2xs` medium, con 44px de ancho mínimo.
- **Elegida:** texto `--text-primary` y subrayado de 2px en `--brand-strong`. **Resto:** texto `--text-muted` y subrayado de 1px en `--border`.
- Sobre el grupo, la etiqueta "MONEDA PRINCIPAL".

**Filas de opción** (tipo de cuenta en el onboarding)
- Filas a todo el ancho, sin margen lateral, separadas por un divisor `--border`. Contenido centrado: ilustración, título (`--text-lg` bold) y descripción (`--text-sm` `--text-secondary`).
- **Seleccionada:** fondo `--brand-tint`, borde izquierdo de 4px en `--brand-strong` (el relleno izquierdo baja 4px para que el contenido no se mueva) y un check de 18px en `--brand-strong` arriba a la derecha. La ilustración pasa de `--text-secondary` a `--brand-strong`.

**Tarjeta de selección (radio-card)**
- El grupo es un `role="radiogroup"` con etiqueta; cada opción es un `<button>` real con `role="radio"` y `aria-checked`. Vale también para las filas de opción y el selector de moneda.
- **Teclado** (vale para todo grupo de opciones: tarjetas, filas, moneda, Gasto/Ingreso, ícono y color): el grupo es una sola parada de Tab, en la opción elegida. Las flechas mueven el foco y eligen a la vez, dando la vuelta en los extremos; Inicio y Fin van a la primera y la última. Lo da `useRadioGroupKeys`: un grupo nuevo lo usa, no reimplementa el teclado.
- **Anatomía:** ícono de 20px, título (`--text-md` bold) y descripción (`--text-sm` `--text-secondary`); a la derecha, un radio circular de 20px. Relleno 16px, radio `--radius-control`.
- **Borde de 1.5px en ambos estados**, para que seleccionar no mueva el layout: `--border` sin seleccionar, `--brand-strong` seleccionada.
- **Seleccionada** (decidido el 2026-09-28): además del borde, el fondo pasa a `--brand-tint`, el ícono a `--brand-strong` y el radio se rellena con un punto de 10px en `--brand-strong`. El estado se marca con tres señales a la vez, no solo con color.
- **Sin seleccionar:** el anillo del radio va en `--border-control` (3:1) y el ícono en `--text-secondary`.

**Ilustraciones**
- **Tipo de cuenta:** 72px (el prototipo usaba 108px; se achica para que el nombre del hogar quepa en el mismo paso). Un círculo punteado en `--border-strong` y una persona de trazo 2px ("Crear en pareja": dos iguales, solapadas −38px). El trazo usa `currentColor`, que la fila cambia según el estado.
- **Pantalla final:** la casa con la moneda, del prototipo, a 218×290px.
  - Los trazos de la casa usan `currentColor` (`--text-primary`); en el prototipo eran negros fijos y en oscuro desaparecían.
  - Los rellenos turquesa y los detalles oscuros dentro de la moneda quedan fijos.
  - La casa y la moneda son dos grupos separados, porque flotan por separado.
- Son decorativas (`aria-hidden`) y viven como componentes en `src/components/illustrations/`, no como imágenes, para poder animarlas y seguir el tema.

**Listas**
- `reset.css` quita viñetas y sangría a todo `<ul>`/`<ol>`: las listas de la app son filas y tarjetas. Cada `<ul>` lleva `role="list"`, porque Safari deja de anunciar como lista un `<ul>` sin viñetas.

**Pie de un diálogo de edición**
- "Archivar" y "Eliminar" van en `DangerRow`, separados del formulario por un divisor, como enlaces de texto: la confirmación, con su botón de color, llega en el diálogo siguiente.

**Errores y carga**
- Es una PWA: sin conexión, cualquier llamada a Supabase puede fallar. Ninguna acción queda colgada: si falla, el botón se libera y el error se muestra en línea.
- Guardar, archivar, reactivar y eliminar pasan por `useAsyncAction` (`src/hooks/`). El error va con `FormError`: `--text-sm`, `--loss-text` y `role="alert"` para que el lector de pantalla lo anuncie. En un formulario va justo sobre el botón de guardar; en `ConfirmDialog`, entre la descripción y los botones. Nunca `alert()`.
- `ConfirmDialog` recibe una acción asíncrona y maneja su propia carga y su error. Mientras la acción corre, no se puede cerrar.
- Los textos de error están en `src/lib/errorMessages.ts` y siguen la regla de "Texto de la interfaz": qué pasó y cómo seguir, sin detalles técnicos.
- **El mensaje nombra la causa real.** "Revisa tu conexión" es solo para los fallos de red. Un error que el usuario puede corregir tiene su propio mensaje: un nombre repetido (código `23505`, `isUniqueViolation`) dice que ya existe y dónde está ("Si está archivada, reactívala desde 'Ver archivadas'"). `run` de `useAsyncAction` acepta una función que elige el mensaje según el error. Un fallo de red se reconoce con `isNetworkError` (Supabase lo devuelve sin `code`). El mensaje técnico de Supabase nunca llega a la pantalla: va a la consola.
- Las listas usan `LoadStatus`: "Cargando…" en `--text-muted`; si falla, el error con un enlace "Reintentar". Así ninguna lista muestra su estado vacío antes de cargar.
- "Cargando…" aparece solo en la primera carga y al reintentar. Las recargas después de guardar actualizan la lista en su lugar: reemplazarla por "Cargando…" en cada guardado la haría parpadear.
- Un monto que depende de datos que no han llegado nunca se muestra como `$0`, que parece un saldo real. El patrimonio muestra un bloque del alto de la línea (en la cabecera, `--surface-on-header`); el total de una sección se omite.

**Estados vacíos** (`EmptyState`)
- Un estado vacío es la primera guía de uso, no un aviso. Dice qué no hay todavía (título corto), para qué sirve lo que va a aparecer ahí o qué falta hacer antes (una o dos frases), y ofrece el paso siguiente (casi siempre un botón secundario para crear lo primero). Borde discontinuo `--border-strong`: marca un lugar que se va a llenar, sin parecer una tarjeta más.
- **Si falta un paso previo, el estado vacío manda ahí**, no al botón que no va a funcionar: Movimientos sin cuentas lleva a Patrimonio; Presupuestos sin categorías, a Categorías. Y el formulario que no se puede guardar por eso lo dice, en vez de dejar "Guardar" desactivado sin explicación.
- Distinto del estado vacío por filtros ("Sin resultados", con "Quitar filtros"): no se mezclan.
- Donde el hogar empieza sin nada que tenga sentido traer de fábrica, se ofrece una plantilla: Categorías tiene "Usar las sugeridas" (`features/categories/suggested.ts`).
- Textos neutros en número: el hogar puede ser de una o de dos personas ("Agrega dónde está el dinero del hogar", no "donde tienen su dinero").

**Carga** (`SkeletonCards`, `SkeletonRows`)
- Mientras llega una lista, una silueta del mismo alto que el contenido real (tarjetas de patrimonio, filas de 56px), en `--surface-sunken`, estática: la carga suele durar menos de un segundo y un brillo en bucle sería movimiento sin información. Se pasa a `LoadStatus` con `skeleton`; sin él, queda el texto "Cargando…".

**Pantallas sin contenido (404 y secciones pendientes)**
- Ninguna ruta termina en una pantalla en blanco ni en un texto suelto. Toda pantalla dice qué es, por qué no hay nada y adónde ir.
- **404** (`NotFound`, ruta `*`): va fuera de la sesión, con el mismo `AuthLayout` que el login, porque cualquiera puede abrir un enlace roto. Tiene un título, una línea que explica la causa y el botón principal "Volver al inicio" hacia `/`, que ya decide si va al resumen o al login.
- **Sección que todavía no existe:** título de la pantalla, ícono del registro en un círculo `--surface-sunken`, qué va a haber y un enlace de texto hacia lo más parecido que ya existe. No promete fechas.

**Gráficos**
- **Todos los gráficos son SVG propios**, los de las historias. Los tres de recharts ("Gastos por categoría", "Ingresos vs. gastos" y "Evolución del patrimonio") se eliminan con el rediseño (decidido el 2026-09-28), y con ellos la librería.
- Cada serie, 3:1 contra el fondo donde está, en ambos modos (los valores medidos están en "Ganancia, pérdida y series" y en las historias).
- **Segmentos vecinos separados:** dos series que se tocan (arcos del anillo, arcos del semicírculo, segmentos de la barra de composición) casi nunca llegan a 3:1 entre sí, porque tienen luminosidad parecida. Por eso van separadas por un espacio de 2–3px del color del fondo, y cada una se mide contra el fondo, no contra su vecina.
- Todo gráfico lleva un resumen en texto (`visually-hidden`) con lo que un lector de pantalla no puede sacar del SVG: el período y los valores que importan. Ej. "Septiembre 2026: ingresos $2.200.000, gastos $1.840.000, balance +$360.000".

**Títulos de pantalla**
- Cada pantalla pone el título de la pestaña con `useDocumentTitle`: "Movimientos · Twoney". La bienvenida, solo "Twoney".
- Cada pantalla tiene un `<h1>`. En login, registro y contraseñas va oculto a la vista (`AuthLayout title`), porque el logo ya encabeza la tarjeta. En Resumen y Patrimonio también va oculto (`<h1 class="visually-hidden">`), porque la cabecera ya dice dónde se está.
- Los títulos de las historias y de las secciones de Patrimonio (Cuentas, Deudas, Inversiones) son `<h2>`.
- Toda `<nav>` tiene `aria-label`.
- El primer elemento con Tab dentro de la app es "Saltar al contenido" (oculto hasta recibir el foco), que lleva al `<main id="contenido">` sin pasar por el encabezado.
- Un botón que alterna un estado (`aria-pressed`) lleva una etiqueta fija que nombra el estado ("Modo oscuro"), nunca una acción que cambia ("Cambiar a modo claro"): el lector ya anuncia "activado" o "desactivado". La del encabezado (escritorio) y la barra inferior (móvil) comparten "Navegación principal", porque nunca se ven las dos a la vez.

## Transiciones y animación

Esta es una app de uso diario: el movimiento comunica un cambio de estado, no decora. Marco de `emil-design-eng`.

**¿Debe animarse?** Según cuántas veces lo ve el usuario:

| Frecuencia | Decisión | Ejemplos |
|---|---|---|
| Muchas veces al día, o con teclado | Sin animación | Atajos, navegación entre pestañas |
| Varias veces al día | Mínima: color u opacidad | Hover, selección |
| Ocasional | Animación estándar | Diálogos, confirmaciones |
| Primera vez o poco frecuente | Puede tener más carácter | Pasos del onboarding |

**Tokens:**
```css
--ease-out: cubic-bezier(0.2, 0.8, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);   /* solo las excepciones de abajo: entra con un leve rebote */
--ease-fill: cubic-bezier(0.22, 0.9, 0.32, 1);      /* barras y líquido que se llenan */
--duration-fast: 150ms;         /* presión, hover, color, salidas */
--duration-base: 220ms;         /* entradas, expandir */
--press-scale: 0.97;            /* :active de botones y controles */
--press-scale-large: 0.99;      /* :active de tarjetas y filas anchas */
--hover-lift: -2px;             /* hover de tarjetas que se pueden abrir */
```

**Reglas:**
- Animar solo `transform` y `opacity`. El color se puede transicionar (hover, cambio de tema). Nunca `width`, `height`, `top`, `left`, `margin` ni `padding`.
- Duración entre 150 y 250ms; ningún elemento de interfaz pasa de 300ms. Las excepciones decididas están abajo, y son las únicas.
- Movimiento (entradas, salidas, presión) con `--ease-out`; cambios de color con `ease`. Nunca `ease-in` ni `transition: all`: cada transición nombra sus propiedades.
- La salida es más rápida que la entrada: el sistema responde rápido cuando el usuario ya decidió.
- Nada aparece desde `scale(0)`: se parte de `scale(0.95)` o más, junto con `opacity: 0`. Excepción: el confeti y el "pop" de las excepciones de abajo.
- **Presión:** todo lo que se presiona responde en `:active` con `transform: scale(var(--press-scale))`, y las tarjetas y filas anchas con `--press-scale-large`, porque 0.97 en algo de todo el ancho se mueve demasiado. Los enlaces de texto no escalan: cambian de color. Una tarjeta que no abre nada no reacciona. Nunca se presiona bajando la opacidad.
- **Hover solo con puntero fino:** todo hover que cambia fondo, borde, sombra o posición va dentro de `@media (hover: hover) and (pointer: fine)`. En pantallas táctiles el hover se "pega" después de tocar, y un fondo gris pegado se nota. El hover que solo cambia el color del texto puede quedar fuera: pegado no se distingue de haberlo tocado.
- **Nada se mueve solo por más de 5 segundos** (WCAG 2.2.2): un bucle decorativo tiene un número fijo de repeticiones que no pasa de 5 s en total, y después se queda quieto.
- **Reducir movimiento** (`prefers-reduced-motion: reduce`) significa menos movimiento, no ninguno: se quitan desplazamientos y escalas, pero se mantienen los fundidos de opacidad y las transiciones de color, que ayudan a entender el cambio. Cómo: `tokens.css` lleva `--press-scale`, `--press-scale-large` y `--hover-lift` a valores neutros, y cada movimiento propio de un componente tiene su excepción en su módulo. Las duraciones no se ponen en 0.
- Preferir transiciones CSS antes que `@keyframes` en todo lo que se puede interrumpir (abrir y cerrar rápido): una transición se retoma desde donde está, un keyframe reinicia.

**Excepciones decididas** (2026-09-28): el final del onboarding y las pantallas principales mantienen las animaciones del prototipo. Se ven al entrar o al cambiar de historia, no mientras se trabaja, y son parte de la identidad.

| Dónde | Qué | Cómo |
|---|---|---|
| Final del onboarding | Aparición de la ilustración | `scale(0.4)` → 1.1 → 1 con opacidad, 550ms `--ease-spring` |
| | Confeti | `scale(0)` → 1 con opacidad, 400ms |
| | Filas de funciones | Suben 12px con fundido, 450ms, escalonadas cada 140ms desde 200ms |
| | Casa y moneda flotando | Casa ±3px en 3.4s (1 vez); moneda ±9px en 2.4s (2 veces). Empiezan a los 600ms |
| Resumen | Contenido de cada historia | "Pop" desde `scale(0.4)`, 500ms `--ease-spring`, cada vez que se cambia de historia |
| | Balance y "por saldar" | Cuentan de 0 al valor en 1000ms (`ease-out` cúbico). El anillo se dibuja en sincronía |
| | Barras de presupuesto | Crecen con `scaleX` desde la izquierda, 900ms `--ease-fill`, escalonadas cada 120ms |
| | Frascos de metas | El líquido sube con `scaleY` desde abajo, 1000ms `--ease-fill`, escalonados cada 100ms |
| Patrimonio | Pista bajo la barra de composición | El chevron baja 3px y vuelve, 1.8s, 2 veces |
| | Barra de composición | Al presionarla se estira en alto (`scaleY(1.4)`) |
| | Fila destacada de la composición | Escala 1.02, 250ms `--ease-spring` |
| | Apilado de tarjetas | Ligado al scroll (ver Patrimonio) |

Reglas de las excepciones:
- **Con reducir movimiento**, nada de lo anterior se desplaza ni escala. Los números muestran directo el valor final; las barras, el anillo y los frascos aparecen llenos con un fundido; la casa y la moneda quedan quietas; el apilado no ocurre.
- **Los números que cuentan** se actualizan tocando el texto del nodo en cada cuadro, no con un render de React, para no rehacer la pantalla 60 veces por segundo ni reiniciar las demás animaciones. El valor accesible es el final desde el primer momento: el número animado lleva `aria-hidden` y al lado va el valor en `visually-hidden`.
- El conteo y el "pop" se repiten cada vez que se entra a una historia, no en cada render.

## Iconografía

Estilo outline (contorno), no relleno. Consistente en todos los íconos de la app: cuentas, navegación inferior, indicadores de categoría.

- **Íconos propios, no de librería.** Los componentes viven todos en `src/components/ui/icons.tsx` (ese archivo solo exporta componentes, para que funcione el recargado en caliente); el registro de los que el usuario elige (clave guardada en la base, componente y etiqueta) está en `iconRegistry.ts`. Todos van sobre una grilla de 20×20 (`viewBox="0 0 20 20"`), trazo de 1.5 (`strokeWidth="1.5"`), extremos y uniones redondeados, color `currentColor`. Un ícono nuevo se agrega ahí, no dentro del componente que lo usa. Si ya existe uno para la misma idea, se reusa en vez de dibujar otro (ej. la pestaña Movimientos usa el mismo `SwapIcon` de antes).
- Los íconos del prototipo están en una grilla de 24 con trazos de 1.6 a 2.4: se redibujan en la grilla de 20, no se copian. Los que faltan son estos:
  - Pestañas: casa (Resumen), barras (Patrimonio), tarjeta (Presupuesto) y cuatro puntos en cuadrícula (Ver más).
  - Tarjetas: banco y móvil.
  - Onboarding: QR, copiar y globo de chat.
  - Pantalla final: rayo, tendencia y diana.
  - Otros: estrella, dinero (Saldar) y flecha a la derecha (CTA).
- Los logos de Google y Apple en `SocialAuthButtons` no son íconos de interfaz sino marcas, con sus colores oficiales: quedan fuera del registro.
- Ningún emoji ni carácter Unicode en lugar de un ícono.

**Excepción:** la estrella de cuenta principal va rellena, porque una estrella de contorno a 13px no se lee.

## Texto de la interfaz

- Los botones nombran su acción ("Crear", "Unirme", "Guardar contraseña"), no "Aceptar" ni "Enviar".
- Los errores dicen qué pasó y cómo seguir: "Ese código no es válido. Pídele a tu pareja que lo copie de nuevo desde 'Ver más'."
- Sin guion largo (—) en el texto visible: se reemplaza por punto, coma, dos puntos o paréntesis. En los comentarios del código no importa.
- Un nombre citado dentro de una frase va entre comillas angulares: «Casa Feliz» ya está configurado.
- Un texto que menciona otro elemento de la interfaz ("desde 'Únete a una'") se revisa cuando ese elemento cambia de nombre: si no, apunta a algo que ya no existe.

## Superficies del navegador

Lo que dibuja el navegador también es parte del diseño: toma colores de la paleta, no los del navegador.

| Qué | Dónde | Valor |
|---|---|---|
| Anillo de foco | `reset.css` | 2px `--focus-ring` (= `--text-primary`). Una superficie oscura en ambos modos (cabecera, historia oscura) redefine `--focus-ring` a `--text-on-header` |
| Selección de texto | `global.css`, `::selection` | fondo `--selection`, texto `--text-primary` (15.7:1 en claro, 8.8:1 en oscuro) |
| Barras de scroll | `global.css`, `scrollbar-color` | pulgar `--text-muted`, riel transparente. El pulgar es un control que se arrastra: necesita 3:1 contra el fondo (el prototipo usaba `rgba(15,23,42,0.15)`, 1.4:1) |
| Controles nativos (calendario de fecha) | `global.css`, `accent-color` | `--brand-strong` |
| Placeholders | `global.css`, `::placeholder` | `--text-muted` |
| Barra del navegador y de estado del celular | `useThemeColor` en cada layout; `index.html` y el manifiesto para antes de que cargue | El color de lo que queda pegado arriba. Cada layout declara su superficie con `useThemeColor('--surface-…')`, que lee el color del CSS y lo vuelve a leer al cambiar el tema. En las pantallas con cabecera: `--surface-header` (`#0F172A` en ambos modos). En autenticación y onboarding: `--surface-page`. Antes de que monte React, `index.html` pone `--surface-page` de cada modo (`#F8FAFC` / `#0E1627`), y el manifiesto de la PWA lleva `#0F172A`. Esos dos no pueden leer una variable CSS: si cambian los tokens, se cambian ahí también |
