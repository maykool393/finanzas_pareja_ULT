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
| `--surface-card` | `#f5f5f0` | `#1e1e1e` |
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

## Transiciones y animación

- Animar solo `transform` y `opacity` (evitar `width`, `height`, `top`, `left` para no forzar recálculo de layout).
- Duración: 150–250ms. Nunca superar 300–400ms.
- Casos de uso: expandir/colapsar secciones, aparición de nuevas transacciones (fade/slide), conteo animado al actualizar montos, transición de color al cambiar entre modo claro/oscuro.
- Respetar siempre `prefers-reduced-motion: reduce`, reduciendo o eliminando animaciones para quienes lo tengan activado en su sistema.

## Iconografía

Estilo outline (contorno), no relleno. Consistente en todos los íconos de la app — cuentas, navegación inferior, indicadores de categoría.

## Navegación inferior

Cinco secciones: Finanzas, Presupuesto, Mover (transferencias), Estadísticas, Ver más. Ítem activo en `--text-primary`, resto en `--text-secondary`.
