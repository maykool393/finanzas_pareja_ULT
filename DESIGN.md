# Sistema de diseño — Finanzas en pareja

Documento de referencia para desarrollo. Úsalo como contexto al pedirle a Claude Code que construya componentes.

## Stack

- React + TypeScript
- Vite
- Supabase (base de datos + autenticación)
- CSS + variables nativas (sin Tailwind)

## Filosofía visual

Base neutra en tonos grises. El color se reserva exclusivamente para elementos con significado financiero: cuentas, deudas, inversiones y categorías. El resto de la interfaz (texto, navegación, iconos estructurales) se mantiene en gris para que el color no compita por atención y siempre indique algo específico.

## Tipografía

```css
--font-sans: 'Ubuntu', system-ui, sans-serif;
```

Cargar con `font-display: swap` para evitar texto invisible mientras carga.

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

| Variable | Claro | Oscuro |
|---|---|---|
| `--surface-page` | `#ffffff` | `#121212` |
| `--surface-card` | `#FAFAFA` | `#1e1e1e` |
| `--text-primary` | `#1a1a1a` | `#f0f0f0` |
| `--text-secondary` | `#5f5e5a` | `#a8a8a4` |
| `--text-muted` | `#888780` | `#6f6f6b` |
| `--border` | `#e0e0da` | `#2e2e2e` |

## Colores — categorías financieras (constantes en ambos modos)

Cada categoría tiene un color de fondo claro (`bg`) y su versión oscura de texto (`text`) para mantener contraste correcto sobre el fondo de color — nunca usar negro genérico sobre estos fondos.

### Cuentas
```css
--account-a-bg: #EAF3DE;
--account-a-text: #173404;   /* Ej: Banesco */
--account-b-bg: #EEEDFE;
--account-b-text: #26215C;   /* Ej: Caixa Bank */
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
--investment-bg: #EEEDFE;
--investment-text: #26215C;
--gain-color: #639922;        /* variación positiva */
--loss-color: #D85A30;        /* variación negativa */
```

**Regla de asignación:** cada cuenta/deuda nueva del usuario rota entre las variantes disponibles (a, b, c...) para diferenciarse visualmente de las demás del mismo tipo. Si se necesitan más de 2 variantes por categoría, definirlas siguiendo el mismo patrón antes de implementar.

## Espaciado y bordes

```css
--radius-card: 12px;
--radius-control: 8px;
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
```

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
- Texto sobre cualquiera de las tres variantes: siempre `--text-primary` (oscuro) — el texto blanco no llega al contraste mínimo de accesibilidad (AA) contra ninguna de ellas. Excepción: son colores fijos que no cambian con `[data-theme="dark"]`, así que en la práctica el texto/íconos sobre ellos usan `#1a1a1a` literal, no la variable (que sí se invierte en modo oscuro).
- No sustituye los colores de categorías financieras ni se usa fuera de flujos de onboarding.
- Pendiente: no tiene variante para modo oscuro — hoy se ve igual en claro y oscuro. Definir si corresponde antes de extenderlo a más pantallas.

## Botones

- Radio de todos los botones de la aplicación: `--radius-control` (8px), sin excepciones — incluidas las tarjetas de selección tipo radio, aunque visualmente parezcan tarjetas.
- Botón secundario: nunca relleno gris — se confunde con un estado deshabilitado. Fondo transparente o `--surface-page`, borde 1px `--border-strong`, texto `--text-primary`. `--surface-sunken` queda reservado para retroalimentación de `hover`, nunca como relleno permanente del botón.

## Fondo — pantallas de autenticación (login, recuperar contraseña, crear cuenta)

Estas tres pantallas comparten el mismo fondo: un degradado difuminado en tonos pastel sobre base clara, generado a partir de los mismos colores de categoría del sistema (no introduce paleta nueva).

**Asset:** `login-background.png` — 1080×2340px (proporción de pantalla móvil), reutilizable como imagen de fondo fija en las tres pantallas.

**Composición:**
- Base: blanco (`#ffffff`).
- Manchas difuminadas en cuatro tonos, mezcladas con opacidad alta para que se noten claramente sobre el blanco:
  - Morado (`--account-b`, `#7F77DD`) — zona izquierda/inferior.
  - Coral (`--debt-a`, `#D85A30`) — zona derecha.
  - Rosa (`--debt-b`, `#D4537E`) — zona superior central.
  - Verde (`--account-a`, `#639922`) — zona inferior.
- Ligera profundidad adicional (sutil, no oscurecimiento fuerte) detrás de donde se ubica el ícono/logo de la app, en la parte superior centrada, para que el ícono destaque sin perder la sensación de fondo claro.
- Grano/dither muy sutil aplicado para evitar bandas de color en el degradado.

**Reglas de uso:**
- El fondo va tras todo el contenido (`z-index` más bajo), fijo o cubriendo el viewport completo.
- Como el fondo es claro y con color, el formulario (inputs, botones, texto) necesita ir sobre una tarjeta con superficie semi-opaca (`--surface-card` con algo de transparencia, ej. `rgba(245, 245, 240, 0.85)`) para mantener contraste — no colocar texto directo sobre el degradado.
- Mismo asset y mismas reglas de tarjeta para las tres pantallas (login, recuperar contraseña, crear cuenta), variando solo el contenido del formulario.
- El fondo tiene una variante para cada modo, con la misma composición de color y posición de manchas — solo cambia la base:
  - Modo claro: `login-background.png` — base blanca (`#ffffff`).
  - Modo oscuro: `login-background-dark.png` — base oscura (`#121212`, mismo valor que `--surface-page` en modo oscuro).
- El componente de fondo debe alternar entre ambos assets según `data-theme`, igual que el resto de la interfaz.

## Componentes clave

**Tarjeta de cuenta/deuda/inversión**
- Fondo de color de categoría, radio `--radius-card`, padding `--space-md`.
- Icono representativo + nombre en la parte superior.
- Monto grande y destacado debajo.
- Icono de persona (avatar) en la esquina inferior derecha para indicar de quién es.

**Barra de progreso (deudas)**
- Altura 5px, radio de pastilla (`border-radius: 99px`).
- Fondo en el tono claro de la categoría, relleno en el tono `fill`.
- Ancho proporcional a pagos completados / pagos totales.

**Encabezado de sección (Cuentas / Deudas / Inversiones)**
- Nombre de sección en gris (`--text-primary`), monto total alineado a la derecha en `--text-secondary`.
- Ícono chevron (no check) para indicar que la sección es expandible/colapsable.

**Toggle de modo oscuro**
- Debe estar accesible desde la pantalla principal.

**Barra de progreso por pasos (onboarding)**
- Un segmento por paso, dentro del área del degradado de marca (ver "Identidad de marca") — nunca sobre una franja neutra separada.
- Segmento(s) completados: relleno con `--gradient-brand-dark`. Pendientes: tono oscuro translúcido (`rgba(26, 26, 26, 0.18)`) sobre el degradado del encabezado.
- Mismo patrón para cualquier flujo de varios pasos, no solo vincular hogar.

**Tarjeta de selección (radio-card)**
- Cada opción es un `<button>` real y accesible, con `aria-pressed`.
- Estado activo: borde 2px con `--gradient-brand-dark`. Estado inactivo: borde 1px `--border`.
- El fondo no cambia entre estados — seleccionar nunca rellena la tarjeta de color, la marca solo el borde.
- Variante en fila (ícono + título + descripción + radio circular a la derecha) para listas de opciones con más texto, ej. cómo repartir gastos. Mismo borde degradado en el estado activo; el punto del radio interno sí se rellena en `--text-primary` (afordance estándar de radio, no "color de marca").

## Transiciones y animación

- Animar solo `transform` y `opacity` (evitar `width`, `height`, `top`, `left` para no forzar recálculo de layout).
- Duración: 150–250ms. Nunca superar 300–400ms.
- Casos de uso: expandir/colapsar secciones, aparición de nuevas transacciones (fade/slide), conteo animado al actualizar montos, transición de color al cambiar entre modo claro/oscuro.
- Respetar siempre `prefers-reduced-motion: reduce`, reduciendo o eliminando animaciones para quienes lo tengan activado en su sistema.

## Iconografía

Estilo outline (contorno), no relleno. Consistente en todos los íconos de la app — cuentas, navegación inferior, indicadores de categoría.

**Excepción:** los íconos del componente `AvatarPair` (persona, corazón) van rellenos. Son un acento decorativo puntual de los flujos de onboarding, no íconos estructurales o de navegación.

## Navegación inferior

Cinco secciones: Finanzas, Presupuesto, Mover (transferencias), Estadísticas, Ver más. Ítem activo en `--text-primary`, resto en `--text-secondary`.
