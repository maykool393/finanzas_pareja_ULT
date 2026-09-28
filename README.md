# Twoney

Finanzas compartidas en pareja. React + TypeScript + Vite + Supabase (Postgres + Auth), CSS con variables nativas (sin Tailwind). Ver [DESIGN.md](DESIGN.md) para el sistema de diseño y `supabase/migrations/` para el historial de esquema aplicado.

**Flujo de SQL**: cada cambio de esquema es un archivo nuevo en `supabase/migrations/` (`npx supabase migration new <descripción>`), nunca se edita uno ya aplicado. `20260902204206_baseline_schema.sql` es el punto de partida (todo lo aplicado antes de adoptar este flujo); de ahí en adelante, una migración por cambio, en el orden en que se van corriendo a mano en el SQL Editor de Supabase.

## Estado actual

Ya construido y en producción de desarrollo:

- **Autenticación**: login, registro, recuperar/restablecer contraseña (`src/pages/Login.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`), sesión vía `useSession`, rutas protegidas vía `RequireAuth`.
- **Onboarding**: `Welcome.tsx` en `/`, solo la primera vez (`hasSeenOnboarding` en `localStorage`).
- **Sistema de diseño**: tokens claro/oscuro (`src/styles/tokens.css`), `RippleBackground`, `AppShell` con nav de 5 secciones, `Card`, `ItemCard`, `SectionHeader`, `ProgressBar`.
- **Esquema base en Supabase**: `households`, `profiles`, `categories`, `accounts`, `debts`, `investments`, `transactions` (columnas mínimas — este plan las extiende), con RLS por household en todas.
- **Dashboard** (`src/pages/Dashboard.tsx`): todo con datos reales de Supabase. La sección "Ahorro" con una meta de ejemplo fija en el código (900.000) se eliminó el 2026-09-27; si se quiere un módulo de metas de ahorro, se construye como los demás (tabla propia + `src/features/`).
- **Rediseño Twoney en curso** (desde el 2026-09-28): nueva identidad visual en toda la app. Ver "Plan de rediseño Twoney" más abajo.

Este documento es el plan de los 7 módulos que faltan. Se actualiza el **Estado** de cada fase a medida que se completa — no se implementa nada de lo descrito aquí hasta acordarlo fase por fase.

## Fases y estado

| Fase | Módulo | Depende de | Estado |
|---|---|---|---|
| 0 | Fundamentos compartidos (UI + convenciones) | — | ✅ Completo |
| 0.5 | Onboarding de household (individual o pareja, invitación por link/QR, preferencias) | Fase 0 | 🟨 Rediseñado — individual verificado en vivo; falta verificar pareja + QR |
| 0.6 | Autenticación social (Google / Apple) | Fase 0 | 🟨 Construido — falta configurar proveedores y verificar en vivo |
| 1 | Categorías de gastos e ingresos | Fase 0 | ✅ Completo — verificado en vivo |
| 2 | Cuentas | Fase 0, 0.5 | ✅ Completo — verificado en vivo |
| 3 | Deudas | Fase 0 | ✅ Completo — verificado en vivo |
| 4 | Inversiones | Fase 0 | ✅ Completo — verificado en vivo |
| 5 | Registro de transacciones | Fases 1, 2 | ✅ Completo — verificado en vivo |
| 6 | Presupuestos | Fases 1, 5 | ✅ Completo — verificado en vivo |
| 7 | Gráfico del dashboard | Fases 2, 3, 4, 5 (idealmente 6) | 🟨 Construido — falta verificar en vivo |

Leyenda: ⬜ Pendiente · 🟨 En progreso · ✅ Completo

**Por qué este orden:** Cuentas, Deudas e Inversiones (2–4) no dependen entre sí ni de Categorías — solo comparten los primitivos de la Fase 0, así que se pueden reordenar libremente entre ellas sin romper nada. Categorías va primero porque Transacciones la necesita y es el módulo más simple para validar los primitivos de formulario/ícono/color de la Fase 0. Transacciones necesita Cuentas (para el saldo) y Categorías (para clasificar). Presupuestos necesita Categorías (qué límite) y Transacciones (qué se ha gastado). El gráfico del dashboard cierra el plan porque es el único módulo que **no aporta datos nuevos**, solo los visualiza — necesita que el resto ya tenga filas reales.

---

## Plan de mejoras (auditoría de diseño, 2026-09-26)

Sale de auditar el código contra DESIGN.md y contra las skills de diseño. Resultado inicial: **13/20** en el formato de `impeccable audit` (accesibilidad 2, rendimiento 2, responsive 3, theming 3, integridad 3). Las etapas se llaman **M0–M6** para no confundirlas con las fases de módulos de arriba.

Cada etapa termina con su propio commit, verificado con `tsc`, lint y build. Se marca aquí al cerrarla.

| Etapa | Qué resuelve | Skill que manda | Estado |
|---|---|---|---|
| M0 | Preparar: liberar disco, commitear el trabajo pendiente | — | ✅ Completo |
| M1 | DESIGN.md como fuente de verdad | impeccable | ✅ Completo |
| M2 | Contraste de color (WCAG AA) | impeccable | ✅ Completo |
| M3 | Accesibilidad de interacción: diálogo y áreas táctiles | impeccable | ✅ Completo |
| M4 | Movimiento e interacción | emil-design-eng | ✅ Completo |
| M5 | Rendimiento: imágenes, bundle, animación de fondo, fuente | impeccable | ✅ Completo |
| M6 | Pulido | impeccable | ✅ Completo |

### M0 — Preparar ✅
- [x] Liberar espacio en C: (estaba al 100%, causaba fallos intermitentes del build).
- [x] Commitear el trabajo pendiente como punto de partida.
- [x] Dejar solo las skills que mandan: `impeccable`, `emil-design-eng` y las de animación. Se eliminaron `high-end-visual-design`, `design-taste-frontend`, `minimalist-ui` y `redesign-existing-projects`, que contradecían DESIGN.md.

### M1 — DESIGN.md como fuente de verdad ✅
Va primero: las etapas siguientes se rigen por él.
- [x] Sección "Skills y precedencia".
- [x] Corregir los desvíos: `aria-checked` en tarjetas de selección, borde de 2px, tokens de inversiones, tokens base del fondo del login, tarjeta semi-opaca del login.
- [x] Documentar los tokens que existen en `tokens.css` pero no en el doc: superficies, texto, bordes, tipografía, sombras, movimiento.
- [x] Sección de formato de montos y moneda.
- [x] Definir los tokens de contraste nuevos que usará M2, con valores verificados contra página, tarjeta y superficie hundida de cada modo.
- [x] Excepción documentada para botones de solo ícono (circulares), con área táctil mínima de 44px.
- [x] Reglas de movimiento alineadas con emil-design-eng: `:active`, hover condicionado, reducir movimiento sin eliminar fundidos.
- [x] Secciones nuevas: variantes de botón, diálogo, texto de la interfaz, superficies del navegador.

Las reglas que el código todavía no cumple quedan marcadas en DESIGN.md con la etapa que las resuelve.

### M2 — Contraste de color ✅
- [x] `--text-muted` a ≥4.5:1 en claro y oscuro (antes 3.0–3.7:1). Afecta etiquetas, hints, ejes de gráficos y placeholders.
- [x] `--gain-text` / `--loss-text` para montos y mensajes de error; `--gain-color` / `--loss-color` quedan para barras y rellenos.
- [x] `--danger-bg` para los botones de eliminar: 5.4:1 en reposo y ≥4.5:1 en hover (antes 3.9:1 en reposo y 3.4:1 en hover).
- [x] Regla global para `::placeholder`: antes cada navegador usaba su gris por defecto, bajo 4.5:1.
- [x] Medidos y documentados los pares que ya cumplían: tarjetas de categoría, texto sobre el degradado del onboarding.

### M3 — Accesibilidad de interacción ✅
- [x] `Dialog`: foco contenido mientras está abierto (Tab y Shift+Tab), devuelto al disparador al cerrar, primer foco en el primer campo. En táctil el foco va al panel, para no abrir el teclado apenas aparece la hoja.
- [x] `Dialog`: el efecto de foco ya no se reinicia en cada render del padre (antes le quitaba el foco al campo en uso cuando el padre se volvía a renderizar). *(Detectado al implementar.)*
- [x] Área táctil de 44px: ThemeToggle, cerrar diálogo y "+" de secciones (zona invisible, se ven igual), `TypeToggle` y `ConfirmDialog` (de 40 a 44px), fila de encabezado de sección.
- [x] Selector de ícono (de 40 a 44px) y de color (zona invisible de 44px, espacio entre muestras de 8 a 12px). *(No estaban en la auditoría.)*
- [x] Piso de 24px (WCAG 2.5.8) para todos los botones de texto, y para "¿Olvidaste tu contraseña?".
- [ ] Verificar en el navegador: Tab dentro de un diálogo, cerrar con Escape y ver que el foco vuelva, y tocar los botones pequeños en el celular.

### M4 — Movimiento e interacción ✅
- [x] `:active` en todo lo que se presiona: `--press-scale` (0.97) en botones y controles, `--press-scale-large` (0.99) en tarjetas y filas anchas.
- [x] `ProgressBar`: `translateX` en vez de animar `width`. Se descartó `scaleX`, que aplastaba el extremo redondeado.
- [x] `Dialog` entra deslizándose (hoja en móvil) o con fundido y escala (centrado), y sale más rápido que entra (150 contra 220ms).
- [x] Reducir movimiento: se mantienen fundidos y color; se quitan escalas y desplazamientos. Antes todas las duraciones pasaban a 0ms.
- [x] Hover condicionado a `(hover: hover) and (pointer: fine)` en todo lo que cambia fondo, borde, sombra o posición.
- [x] **Hover visible en todos los botones**: primario, eliminar y confirmar con token de fondo propio; CTA con degradado con una capa blanca (aclara porque el texto es oscuro, así sube el contraste); tarjetas de selección y filas con borde más marcado; toggle Gasto/Ingreso con color. Se agregó el hover que faltaba en enviar de login y registro.
- [x] **Foco al cerrar un diálogo**: volvía al botón pero sin anillo visible, porque el diálogo desaparecía antes y el foco pasaba por `<body>`. Ahora el diálogo sigue montado durante la salida mostrando su último contenido. *(Reportado al probar la M3.)*
- [ ] Verificar en el navegador: hover en cada tipo de botón, cerrar un diálogo con Escape y ver el anillo en el botón que lo abrió, y activar "reducir movimiento" en el sistema operativo.

### M5 — Rendimiento ✅

| | Antes | Después |
|---|---|---|
| Precache de la PWA | 5.48 MB, 23 archivos | 1.46 MB, 34 archivos (−73%) |
| JS inicial | 929 KB (264 KB gzip) | 520 KB (145 KB gzip), −45% |
| Fondo del login (cada modo) | 2.2 MB PNG | ≈100 KB WebP |
| Foto de bienvenida | 507 KB JPG, sin precachear | 29 KB WebP, precacheada |

- [x] Fondos y foto a WebP calidad 90. Se probaron q80 y AVIF: borraban el grano que evita las bandas del degradado (verificado con recortes ampliados).
- [x] Precache: se suma `webp`, se excluyen `email-logo.png` y `testicon-*`, y el límite vuelve a 2 MiB (antes se había subido a 5 MiB solo por los PNG). La foto de bienvenida no se precacheaba porque el patrón no incluía `.jpg`. *(Detectado al implementar.)*
- [x] Gráficos (recharts) y librería de QR cargados bajo demanda.
- [x] `RippleBackground`: el loop corre solo mientras hay ondas; reducir movimiento se consulta en cada toque.
- [x] Fuente Ubuntu alojada en el proyecto (Fontsource, subconjunto latino, solo los pesos en uso). Sin conexión, la app ya no cae a la fuente del sistema.
- [x] **La primera carga después de un despliegue mostraba la versión anterior**: el service worker viejo servía su `index.html` y su JS, y la foto de bienvenida salía rota (pedía el `.jpg` ya borrado). El registro por defecto nunca recargaba la página; ahora se registra con `virtual:pwa-register` y recarga sola al activarse la versión nueva. También se agregó un color de respaldo detrás de la foto. *(Reportado al probar la M5.)*
- [ ] Pendiente, fuera del alcance original: el JS inicial sigue sobre el aviso de 500 KB de Vite (lo pesado es React, Supabase y el router). Bajar de ahí requiere cargar las pantallas por ruta.
- [ ] Verificar en el navegador: el dashboard carga los gráficos sin saltos, la app abre sin conexión con la fuente correcta y los fondos se ven sin bandas.

### M6 — Pulido ✅
- [x] Sin guiones largos en el texto visible (4 casos).
- [x] El texto de "Invitar a tu pareja" mandaba a buscar "¿Tu pareja ya tiene un espacio?", un enlace que ya no existe desde el rediseño del onboarding. Ahora dice "¿Tienes un código? Únete aquí". *(Detectado al implementar.)*
- [x] Tema para selección de texto, barras de scroll y calendario de fecha nativo. El pulgar de scroll usa `--text-muted` (con `--border-strong` quedaba en 1.7:1).
- [x] Íconos al registro de `icons.tsx` con trazo 1.5: no solo `AppShell` y `Dialog`, también `SectionHeader`, `ThemeToggle` y `More` (11 íconos). La pestaña "Finanzas" reusa el `WalletIcon` existente. Solo quedan fuera los logos de Google y Apple, que son marcas.
- [x] Una sola elevación: `Card` y la tarjeta del login quedan con borde, sin sombra.
- [x] QR sin tarjeta anidada: el margen blanco va dentro de la imagen, con la zona de silencio de 4 módulos que pide la especificación (antes era 1, compensada con la caja).
- [ ] Verificar en el navegador: íconos de la navegación y del encabezado, escanear el QR en modo claro y oscuro, seleccionar texto y ver la barra de scroll.

### Cierre del plan
Las seis etapas están implementadas. Falta:
- Las verificaciones en el navegador marcadas en M3, M4, M5 y M6.
- Volver a correr la auditoría para medir el puntaje contra el 13/20 inicial.
- Pendiente fuera del plan (M5): cargar las pantallas por ruta, para bajar el JS inicial de los 500 KB.

**Fuera de este plan:** skeletons de carga y estados vacíos que guíen al usuario. Es trabajo de diseño, no de corrección; va como tarea propia con `impeccable onboard`.

---

## Plan de mejoras 2 (segunda auditoría, 2026-09-27)

Segunda pasada sobre el código completo, después de cerrar M0–M6. Lo que ya estaba bien no se toca: hovers condicionados, transiciones con propiedades nombradas, animaciones solo de `transform`/`opacity`, textos alternativos. Lo que queda son fallos que el usuario puede ver (sobre todo sin conexión, que en una PWA es lo normal), accesibilidad y diferencias entre DESIGN.md y el código.

| Etapa | Qué resuelve | Skill que manda | Estado |
|---|---|---|---|
| M7 | Errores y carga | impeccable | ✅ Completo |
| M8 | Rutas y navegación | impeccable | ✅ Completo |
| M9 | Limpieza de componentes y tokens | impeccable | ✅ Completo |
| M10 | DESIGN.md y configuración | — | ✅ Completo |

### M7 — Errores y carga ✅
Ningún formulario, borrado ni carga de datos manejaba errores: la capa `api.ts` lanza la excepción y nadie la atrapaba.
- [x] Guardar: si falla, el botón quedaba en "Guardando…" para siempre y sin mensaje. Ahora los 6 formularios muestran el error sobre el botón y se puede reintentar (`useAsyncAction` + `FormError`).
- [x] Eliminar y archivar: el diálogo de confirmación quedaba cargando. Ahora maneja su propia carga y muestra el error; los 10 lugares que lo usan ya no llevan su propio `confirmLoading`.
- [x] Reactivar un archivado (cuentas, deudas, inversiones, categorías): fallaba sin aviso.
- [x] Cargar listas: `loading` no volvía a `false`. Ahora cada lista muestra el error con "Reintentar" (`LoadStatus`).
- [x] `loading` cubre solo la primera carga y los reintentos: las recargas después de guardar actualizan la lista sin reemplazarla por "Cargando…", así no parpadea. *(Detectado al implementar.)*
- [x] Dashboard: el patrimonio mostraba $0 mientras cargaba (ahora un bloque del mismo alto) y los totales de sección también ($0 → vacío). "Actualizado hoy" era un texto fijo; ahora dice cómo se calcula. "Últimos movimientos" mostraba "Aún no hay movimientos" antes de cargar. Si fallan los gráficos, se ve el error en vez de desaparecer.
- [x] Un solo estado de carga para todas las listas (antes "Cargando…" en unas pantallas y nada en otras).
- [x] Los mensajes de error se anuncian a los lectores de pantalla (`role="alert"`), también en login, recuperar contraseña y onboarding.
- [ ] Verificar en el navegador: con la red cortada (DevTools → Network → Offline), guardar, eliminar, reactivar y recargar una pantalla; ver el mensaje y que "Reintentar" funcione al volver la red.

### M8 — Rutas y navegación ✅
- [x] Página 404 (`NotFound`, ruta `*`): una URL desconocida mostraba una pantalla en blanco. Usa el fondo y la tarjeta del login, porque cualquiera puede abrir un enlace roto; "Volver al inicio" va a `/`, que decide entre dashboard y login. Verificada en claro y oscuro con capturas a 390px.
- [x] "Estadísticas": era un `<p>` suelto. Ahora es una pantalla (`Statistics`) con título, qué va a haber y un enlace a los gráficos que ya existen en Finanzas.
- [x] `theme-color` según el tema: la barra del navegador era blanca fija. Ahora toma `--surface-card` de cada modo (igual al encabezado) y sigue al tema elegido a mano. El manifiesto pasa de `#ffffff` a `#FAFAFA`.
- [x] **El tema elegido a mano se aplicaba tarde o nunca**: lo ponía React al montar el botón de tema o el fondo del login, así que cada pantalla se pintaba primero con el tema del sistema, y la bienvenida y el onboarding nunca lo aplicaban. Ahora lo aplica un script en `index.html` antes del primer pintado. *(Detectado al implementar.)*
- [x] `<h1>` en el Dashboard (oculto a la vista, "Finanzas"; el encabezado visible es el patrimonio) y `aria-label` en la navegación del encabezado y en "Ver más".
- [ ] Verificar en el navegador: la pantalla de Estadísticas (necesita sesión, no se pudo capturar); elegir modo oscuro a mano con el sistema en claro, recargar y ver que no parpadea, también en la bienvenida; en el celular, el color de la barra de estado en cada modo.

### M9 — Limpieza de componentes y tokens ✅
- [x] **El patrimonio no se actualizaba al guardar desde el dashboard.** `Dashboard` y cada sección cargaban los datos por separado. Ahora `Dashboard` los carga una vez y los pasa a las secciones, así el total del encabezado, los gráficos y las tarjetas leen el mismo estado. *(Detectado en M7.)*
- [x] Las tres secciones (≈505 líneas casi iguales) son ahora una `FinanceSection` común (`features/dashboard/`) más una configuración corta por tipo (≈45 líneas cada una). La fila "Archivar / Eliminar", copiada en 4 archivos, es `DangerRow`.
- [x] `ItemCard` es un `<button>` real, en vez de `<article role="button">`. Su nombre accesible incluye monto, avance (deudas) y dueño: "Crédito auto, $5.400.000, 40 % pagado, compartida". Antes el dueño era un `aria-label` en un `<span>`, que se ignora, y decía "Cuenta de…" también en deudas e inversiones. `ProgressBar` pasó a `<span>` para poder ir dentro del botón.
- [x] Valores sueltos a tokens: `--text-on-brand` y `--text-on-brand-accent` (texto sobre el degradado, antes `#1a1a1a` y `#3D5FA8`), `--brand-track`, `--shadow-brand-cta`, `--radius-sheet`, `--shadow-sheet`, `--scrim` (fondo del diálogo) y `--surface-on-category` (avatar y riel en las tarjetas). El color del monto en `TransactionList` pasó de `style` a clases. Se quitó `--shadow-sm`, que no se usaba. Quedan con valores propios, a propósito: `Welcome` (colores sobre una foto), los colores del QR y el canvas de `RippleBackground`.
- [x] `100dvh` en `RequireAuth`, `AppShell` y `reset.css`.
- [x] **Viñetas y sangría en las listas**: ningún CSS las quitaba, y en los movimientos (pantalla y dashboard) se veían viñetas y 40px de sangría. Ahora `reset.css` las quita, y cada `<ul>` lleva `role="list"` para no perder la semántica en Safari. *(Detectado al verificar con capturas.)*
- [x] **La barra de avance de una deuda pasaba por debajo del avatar del dueño.** Ahora termina antes. *(Detectado al verificar con capturas.)*
- [x] **Signo antes del símbolo**: los gastos se veían `$-23.990` (formato de Intl para `es-CL`) y los ingresos `+$850.000`. Ahora `formatCurrency` pone el signo siempre antes: `-$23.990`. El `+` de los ingresos también pasó a `formatCurrency` (`{ signed: true }`), en vez de agregarse a mano en `TransactionList`. *(Decidido después de cerrar M9.)*
- [x] Verificado con una página temporal (ya borrada) que monta `FinanceSection` y `TransactionList` con datos de ejemplo: tarjetas, carga, error, lista de movimientos y nombres accesibles, en claro y oscuro a 390px.
- [ ] Verificar en el navegador, con sesión: crear una cuenta desde el dashboard y ver que el patrimonio cambia sin recargar; navegar las tarjetas con Tab y abrirlas con Enter; el onboarding se ve igual que antes (solo cambiaron nombres de tokens).

### M10 — DESIGN.md y configuración ✅
- [x] DESIGN.md decía que los botones de eliminar bajan la opacidad a 0.9 en hover, contra la regla "hover = fondo, nunca opacidad". Ahora describe lo que hace el código: `--danger-bg-hover`.
- [x] Casos de animación: separados los que existen de los pendientes (despliegue de secciones, entrada de movimientos, conteo de montos), con una nota sobre la frecuencia antes de hacer el conteo.
- [x] **Degradado de marca en modo oscuro: se mantiene claro** (decidido el 2026-09-27, con capturas del estado actual). La hoja sigue el tema y el contraste ya cumplía. Lo único que cambia en oscuro es la sombra del botón "Crear": la teñida de rosa y azul se veía como un halo sobre la hoja oscura y pasa a una sombra neutra. Se descartaron forzar el onboarding en claro y diseñar una variante oscura del degradado.
- [x] `.claude/` y `dist/` fuera del lint (`.oxlintrc.json`): `npm run lint` pasa de 125 avisos a 0.
- [x] Los 13 avisos del proyecto, uno por uno:
  - 8 falsos positivos de `set-state-in-effect` (los 6 hooks de datos, `useHousehold`, `useHouseholdId`): el efecto llama a `refresh()`, cuyo primer `setState` llega después de un `await`. Silenciados con el motivo escrito encima.
  - `Login`: el error que Supabase deja en la URL se lee en el estado inicial, no con un `setState` en un efecto; el efecto solo limpia la URL.
  - `RequireHousehold`: si al montar hay una invitación pendiente, arranca "uniéndose" desde el estado inicial, en vez de ponerlo en el efecto.
  - `icons.tsx` (3): exportaba el mapa `ICONS` y las listas de opciones junto a los componentes, lo que rompe el recargado en caliente. Pasaron a `iconRegistry.ts` con sus tipos; `icons.tsx` solo exporta componentes.
- [x] DESIGN.md decía `S/1.234`; el código da `S/ 1.234` (con espacio, como lo pone `Intl` y como se escribe en Perú). Se corrigió el documento.
- [ ] Verificar en el navegador: entrar por un link de invitación con sesión ya iniciada (debe unirse sin pasar por el onboarding) y volver de un enlace de correo vencido (debe verse el error en el login).

### Cierre del plan 2
Las cuatro etapas están implementadas. Falta:
- Las verificaciones en el navegador marcadas en M7, M8, M9 y M10.
- Pendiente de M5, fuera de este plan: cargar las pantallas por ruta, para bajar el JS inicial de los 500 KB.
- Pendientes de diseño, no de corrección: la pantalla de Estadísticas y las animaciones marcadas como pendientes en DESIGN.md.

---

## Plan de mejoras 3 (tercera auditoría, 2026-09-27)

Auditoría en el formato de `impeccable audit`: **15/20** (Bueno), contra 13/20 de la primera. Accesibilidad 3, rendimiento 3, diseño adaptable 3, tokens y temas 3, coherencia 3. El detector de `impeccable` no encontró nada en los 115 archivos de `src` ni en las pantallas públicas renderizadas a 390px (bienvenida, login, 404).

| Etapa | Qué resuelve | Skill que manda | Estado |
|---|---|---|---|
| M11 | Montos con centavos | impeccable (harden) | ✅ Completo |
| M12 | Teclado en grupos de opciones y título por pantalla | impeccable (harden) | ✅ Completo |
| M13 | Carga de datos: límites, paginación y carga por ruta | impeccable (optimize) | ✅ Completo |
| M14 | Ajustes del hogar y detalles menores | impeccable (harden, polish) | ✅ Completo |

### M11 — Montos con centavos ✅
**Fallo (P1):** `NumberField` borraba todo lo que no fuera dígito. En euros, dólares, soles o pesos mexicanos, escribir `12,50` guardaba **1.250**, cien veces más, sin que se notara, porque los montos se mostraban sin decimales. La base (`numeric(14, 2)`) sí acepta centavos, y DESIGN.md y `format.ts` decían por error que los montos se guardaban "en la unidad menor (enteros)". **Decisión (2026-09-27): se aceptan centavos** en las monedas que los usan.
- [x] Decimales por moneda (`getCurrencyDecimals` en `format.ts`): 0 para CLP y COP, 2 para USD, EUR, MXN, ARS y PEN.
- [x] `NumberField` interpreta lo escrito con `parseAmount`: coma decimal y punto de miles (`1.234,50`); un solo punto seguido de 1 o 2 dígitos también es decimal (`12.5`), y `1.234` sigue siendo mil. Los decimales de más se descartan. Teclado con coma solo en monedas con decimales. El número de cuotas sigue siendo entero.
- [x] `formatCurrency` muestra los decimales de la moneda: `€12,50`, `€1.234,00`, `$1.234`. El formato compacto (`$3 M`) sigue sin decimales.
- [x] DESIGN.md y `format.ts` corregidos: los montos se guardan en unidades de la moneda con 2 decimales, no en la unidad menor.
- [x] Probado con 12 entradas (`12,50`, `12.5`, `1.234`, `1.234,56`, `1234,567`, `-45,9`, vacío…) y 7 formatos en distintas monedas.
- [ ] Verificar en el navegador con un hogar en euros o dólares: registrar `12,50`, ver `€12,50` en la lista y que el saldo de la cuenta baje exactamente eso. Los montos que ya se guardaron multiplicados por 100 no se corrigen solos: hay que editarlos a mano.

### M12 — Teclado en grupos de opciones y título por pantalla ✅
- [x] Flechas en los 5 grupos de opciones (`TypeToggle`, `IconPicker`, `ColorPicker`, `RadioCardGroup`, `RadioListGroup`), con un hook común (`useRadioGroupKeys`): el grupo es una sola parada de Tab y las flechas mueven el foco y eligen, dando la vuelta; Inicio y Fin van a los extremos. Antes cada opción era una parada de Tab y las flechas no hacían nada.
- [x] Título de la pestaña por pantalla con `useDocumentTitle` ("Movimientos · Twoney"), en las 13 pantallas; el login cambia entre "Iniciar sesión" y "Crear cuenta". Antes siempre decía "Twoney" (WCAG 2.4.2).
- [x] Probado en Chromium con Playwright sobre una página temporal (ya borrada): Tab, flechas en ambos sentidos, Inicio, Fin y Shift+Tab en Gasto/Ingreso y en el selector de ícono; títulos de la 404 y del login.
- [ ] Verificar con un lector de pantalla (NVDA o VoiceOver): que anuncie "botón de opción, 2 de 6" al moverse con flechas, y el título nuevo al cambiar de pantalla.

### M13 — Carga de datos ✅
- [x] "Últimos movimientos" pide solo 5 (antes descargaba todo el historial).
- [x] Movimientos por páginas de 50, con "Cargar más". Después de guardar se recargan las páginas ya abiertas, y si alguien agregó un movimiento entre medio no se repiten filas. Orden estable (fecha y luego id) para que las páginas no salten filas.
- [x] **Gráficos y presupuestos también se habrían cortado en 1000 filas** (6 meses de movimientos, 5–6 por día): ahora se piden en bloques de 1000 hasta el final. *(Detectado al implementar.)*
- [x] Caché compartida (`lib/sharedQuery.ts`) para el hogar, las cuentas, las categorías y los miembros: se piden una vez para toda la app y se renuevan después de 30 segundos o al guardar; se borran al cambiar de usuario. Abrir el dashboard hacía unas 8 consultas del mismo perfil; ahora una. Los formularios ya no vuelven a pedir datos al abrirse.
- [x] Guardar, editar o borrar un movimiento recarga también las cuentas: los saldos los cambia la base, y con la caché habrían quedado viejos. *(Detectado al implementar.)*
- [x] Si falla la carga del hogar, se muestra el error con "Reintentar" y "Cerrar sesión". Antes el fallo se leía como "no tiene hogar" y mandaba al onboarding a quien ya tenía uno. *(Detectado al implementar.)*
- [x] Carga por ruta: JS inicial de 538 a 477 KB (154 → 138 KB comprimido), bajo el aviso de 500 KB. Lo que queda es React, Supabase y el router. Probado en el build con Playwright: login, 404 y recuperar contraseña abren sus fragmentos, sin errores en consola.
- [ ] Verificar con sesión: "Cargar más" en Movimientos; guardar un movimiento y ver el saldo nuevo en el dashboard sin recargar; cerrar sesión y entrar con otra cuenta sin ver datos de la anterior.

### M14 — Ajustes del hogar y detalles menores ✅
- [x] "Ajustes del hogar" en "Ver más" (`/ajustes`): nombre, moneda y reparto de gastos (este último solo con dos personas en el hogar). El onboarding ya prometía "Podrás cambiarla más adelante desde los ajustes de tu hogar". Si se elige otra moneda, un aviso resalta que los montos no se convierten, solo cambia el símbolo. El hogar pasó a la caché compartida: al guardar, la moneda cambia en toda la app sin recargar. Las opciones de moneda y reparto se movieron a `features/household/preferences.tsx`, compartidas con el onboarding.
- [x] **La línea del patrimonio casi no se veía en modo oscuro** (1,15:1 contra la tarjeta): usaba `--account-b-text`, un tono oscuro fijo. Ahora `--account-b` (3,6:1 en claro, 4,4:1 en oscuro). *(Detectado al implementar.)*
- [x] Resumen en texto de "Ingresos vs. gastos" y "Evolución del patrimonio", para lectores de pantalla.
- [x] Títulos de sección (Cuentas, Deudas, Inversiones) como `<h2>` con el botón adentro (patrón de acordeón).
- [x] `90dvh` en el diálogo; tooltips y ejes de los gráficos con estilos compartidos y tokens. La primera fecha del gráfico de patrimonio salía cortada ("9 jun"): el eje tiene margen.
- [x] `<h1>` en login, registro, recuperar y nueva contraseña (oculto a la vista: el logo ya encabeza la tarjeta).
- [x] Verificado con Playwright en una página temporal (ya borrada): encabezados, resúmenes, `<h1>` del login y captura de los gráficos en oscuro a 390px.
- [ ] Verificar con sesión: cambiar la moneda en "Ajustes del hogar" y ver el símbolo nuevo en el dashboard sin recargar; que el reparto aparezca solo con dos personas.

### Cierre del plan 3
Las cuatro etapas están implementadas. Falta:
- Las verificaciones con sesión y con lector de pantalla marcadas en M11–M14.
- Pendientes de diseño: la pantalla de Estadísticas y las animaciones marcadas como pendientes en DESIGN.md.

---

## M15 — Estados vacíos que guían y skeletons de carga (`impeccable onboard`)

Pendiente desde el cierre del plan 1 ("skeletons de carga y estados vacíos que guíen al usuario"). M7 dejó la carga y los errores consistentes, pero los estados vacíos siguen siendo frases sueltas ("Sin cuentas todavía.") y la carga, el texto "Cargando…". Un hogar recién creado no tiene cuentas ni categorías, y la app no dice por dónde empezar.

**Dependencias del primer uso que hoy nadie explica:** un movimiento necesita una cuenta (sin ella, "Guardar" queda desactivado sin decir por qué) y un presupuesto necesita una categoría (el hogar empieza sin ninguna).

**Estado:** ✅ Completo.

- [x] `EmptyState`: título corto, para qué sirve lo que va a aparecer y el paso siguiente (casi siempre un botón). Borde discontinuo, para que no se lea como una tarjeta que falló.
- [x] Cuentas, deudas e inversiones: estado vacío con su botón de crear, que abre el formulario de la sección.
- [x] Movimientos: sin cuentas, "Primero, una cuenta" con "Ir a Finanzas"; con filtros sin resultados, "Quitar filtros"; si no, "Registrar el primero". El formulario explica por qué no se puede guardar sin cuenta. En el dashboard, "Ir a Movimientos".
- [x] Presupuestos: sin categorías, "Primero, categorías" con "Ir a Categorías"; si no, "Crear el primero". El formulario explica por qué no se puede guardar cuando no quedan categorías disponibles.
- [x] Categorías: "Usar las sugeridas" crea de un toque 7 categorías comunes (6 de gasto y Sueldo) en un solo pedido, o "Crear la primera". "Ver archivadas (0)" ya no aparece sin archivadas.
- [x] Dashboard sin nada registrado: bajo el patrimonio, "Agrega tu primera cuenta abajo para empezar a ver el patrimonio".
- [x] Skeletons del mismo alto que el contenido (tarjetas en las secciones del dashboard; filas en Movimientos, últimos movimientos, Presupuestos y Categorías), estáticos.
- [x] Textos neutros en número: el hogar puede ser de una persona.
- [x] Verificado con capturas en claro y oscuro a 390px (página temporal, ya borrada).
- [ ] Verificar con un hogar nuevo: recorrer el primer uso (Dashboard vacío → primera cuenta → primer movimiento → categorías sugeridas → primer presupuesto) y que cada estado vacío lleve al paso correcto.


---

## M16 — Cuarta auditoría: errores con su causa y detalles de accesibilidad

Auditoría en el formato de `impeccable audit`: **18/20** (Excelente), contra 15/20 de la tercera y 13/20 de la primera. Accesibilidad 3, rendimiento 4, diseño adaptable 4, tokens y temas 4, coherencia 3. El detector no encontró nada en los 158 archivos de `src` ni en las 5 pantallas públicas renderizadas a 390px.

**Estado:** ✅ Completo.

- [x] **[P2] Los errores siempre culpaban a la conexión.** Las categorías no admiten dos con el mismo nombre en un hogar (`unique (household_id, name)`), y crear una repetida (aunque la otra esté archivada) decía "Revisa tu conexión". Ahora dice `Ya existe una categoría llamada "…". Si está archivada, reactívala desde "Ver archivadas".` `useAsyncAction` acepta una función que elige el mensaje según el error, e `isUniqueViolation` reconoce el duplicado (código `23505`).
- [x] **[P2] "Usar las sugeridas" fallaba entera** si ya existía alguna con el mismo nombre (por ejemplo, archivada). Ahora crea solo las que faltan; si ya existen todas (archivadas), lo dice y manda a "Ver archivadas".
- [x] [P3] Botón de tema: etiqueta fija "Modo oscuro" con `aria-pressed` (antes "Cambiar a modo claro, activado").
- [x] [P3] Ajustes del hogar: "Cambios guardados." desaparece al volver a editar.
- [x] [P3] `NumberField`: `<span>` en vez de `<div>` dentro del `<label>`.
- [x] [P3] Enlace "Saltar al contenido": primer elemento con Tab, oculto hasta recibir el foco, lleva al `<main>`.
- [x] Probado con Playwright (página temporal, ya borrada): el enlace aparece con Tab, Enter pasa el foco al contenido y el Tab siguiente cae en el primer control; el botón de tema se anuncia "Modo oscuro".
- [x] **[P2] El onboarding mostraba el error técnico de Supabase** al fallar crear el hogar, vincularlo o guardar las preferencias ("Cannot coerce the result to a single JSON object", o "TypeError: Failed to fetch" sin conexión). Ahora muestra "No se pudo crear el hogar. Revisa tu conexión…"; el detalle va a la consola. *(Detectado al volver a auditar.)*
- [x] **Unirse con un código sin conexión decía "Ese código no es válido".** `isNetworkError` distingue un fallo de red (Supabase lo devuelve sin `code`, verificado en `postgrest-js`) de un código inválido (`22P02`, `23503`). *(Detectado al volver a auditar.)*
- [ ] Verificar con sesión: crear una categoría con un nombre que ya existe (activa o archivada) y ver el mensaje nuevo; en el onboarding, con la red cortada, crear un hogar y unirse con un código.
- [x] **Texto del tooltip de los gráficos ilegible** (reportado al usarlo): tomaba el color de la serie. En "Gastos por categoría" eran los fondos pastel sobre la tarjeta, 1,1:1; en "Ingresos vs. gastos" y "Evolución del patrimonio", 3,3–4,4:1, bajo el 4,5:1 del texto. Ahora los tres usan `--text-primary` (16,7:1 en claro, 14,6:1 en oscuro), con la etiqueta en `--text-secondary`. Verificado con Playwright pasando el mouse sobre el gráfico en claro y oscuro.

---

## Plan de rediseño Twoney (2026-09-28)

Lleva la app a la identidad nueva del prototipo "Twoney" (artefacto en claude.ai: https://claude.ai/artifact/ACWje21BdC9KtSBfeVUWYy). La identidad cambia en cinco cosas:
- Grises fríos (slate) con turquesa de marca, en vez de grises cálidos con degradado rosa → azul.
- Modo oscuro en slate azulado.
- Radio de 8px en todo.
- Navegación de 5 pestañas: Resumen, Patrimonio, Presupuesto, Movimientos y Ver más.
- Resumen en historias; Patrimonio con tarjetas que se apilan.

[DESIGN.md](DESIGN.md) ya está reescrito con el diseño nuevo y es la referencia de cada etapa. Donde el prototipo no cumplía contraste, manda el documento.

Las etapas se llaman **R1–R8** para no confundirlas con las fases de módulos ni con las etapas M. Cada una termina con su commit, verificado con `tsc`, lint y build, y se marca aquí al cerrarla.

| Etapa | Qué resuelve | Depende de | Estado |
|---|---|---|---|
| R1 | Tokens: paleta, tonos, tipografía, radios, sombras, movimiento | — | 🟨 Commit hecho — falta tu revisión visual |
| R2 | Estilos globales y superficies del navegador | R1 | 🟨 Commit hecho — falta tu revisión visual |
| R3 | Componentes compartidos | R1, R2 | 🟨 Commit hecho — falta tu revisión visual |
| R4 | Estructura: navegación, cabecera, login | R3 | ⬜ Pendiente |
| R5 | Onboarding nuevo | R3, R4 | ⬜ Pendiente |
| R6 | Patrimonio | R3, R4 | ⬜ Pendiente |
| R7 | Resumen (historias) | R3, R4 | ⬜ Pendiente |
| R8 | Limpieza y verificación final | R1–R7 | ⬜ Pendiente |

R5, R6 y R7 no dependen entre sí: se pueden hacer en cualquier orden. R6 y R7 tienen decisiones pendientes (ver abajo) que conviene cerrar antes de empezarlas.

### R1 — Tokens 🟨
- [x] `tokens.css` nuevo:
  - Paleta slate en claro y slate azulado en oscuro, con todos los pares de texto y fondo medidos.
  - Marca (`--brand`, `--brand-strong`, `--brand-text`, `--brand-tint`), personas del hogar y 6 tonos de tarjeta (en oscuro, vidrio tintado opaco).
  - Series de gráficos, botón destructivo, radios de 8px, sombras y tokens de movimiento de las animaciones del Resumen.
- [x] Escala tipográfica nueva (11 a 96px). El `--text-lg` de 20px pasa a `--text-xl` en sus 11 usos, así ninguna pantalla cambió de tamaño.
- [x] Consumidores de los tokens eliminados:
  - Botón primario con degradado de marca (`Button`, login, `ConfirmDialog`).
  - `ItemCard` con los tonos nuevos.
  - Selección con tinte + borde (`RadioCardGroup`, `RadioListGroup`, `TypeToggle`).
  - Colores de categoría y de los formularios. Las claves guardadas en la base no cambian; cambian los nombres visibles: Turquesa, Lavanda, Ámbar, Rosa, Pizarra, Celeste.
  - Gráficos: patrimonio en índigo; la torta usa colores sólidos.
  - Onboarding actual en versión neutra provisional.
  - Ondas del login en `--brand`.
- [x] Build y lint.
- [ ] Revisión visual en claro y oscuro (`npm run dev`).
- [x] Commit.

### R2 — Estilos globales y superficies del navegador 🟨
- [x] `useThemeColor` (hook nuevo): cada layout declara qué superficie queda arriba y el color de la barra del celular se lee del CSS. Reemplaza los colores escritos a mano en `useTheme.ts`.
- [x] `index.html` y el manifiesto de la PWA con los colores nuevos (`--surface-page` antes de cargar; `#0F172A` en el manifiesto).
- [x] Fondo de página con `--gradient-page`; selección de texto con `--selection`; `accent-color` en `--brand-strong`.
- [x] Token `--focus-ring` para el anillo de foco, redefinible a blanco sobre superficies oscuras.
- [x] QR en el slate nuevo. Tarjetas de selección transparentes, para que no corten el degradado.
- [x] DESIGN.md § Superficies del navegador actualizado.
- [ ] Revisión visual, y en un teléfono con la PWA instalada: la barra de estado cambia con el tema.
- [x] Commit.

### R3 — Componentes compartidos 🟨
- [x] **Botones:**
  - Deshabilitado con `--surface-sunken` + `--text-disabled`, no `opacity: 0.6` (en `Button`, login, `ConfirmDialog` y el CTA del onboarding).
  - Variante `onDark` (contorno sobre fondo oscuro).
  - `IconButton`: botón de solo ícono circular (24, 28 o 34px), con zona táctil de 44px.
- [x] **Campos:**
  - Estándar con borde 1.5px `--border-control`, fondo `--surface-card` y foco `--brand-strong`. Aplica a `TextField`, `NumberField` y `Select`, que comparten `formField.module.css`, y a los campos del login.
  - Deshabilitado sin opacidad.
  - `TextField` con variantes `underline` y `code`. El código es el UUID del hogar (36 caracteres), así que va en `--text-md`, no en el `--text-2xl` del prototipo.
- [x] **Tarjetas de selección** (`RadioListGroup`): borde de 1.5px en ambos estados, ícono de 20px sin burbuja y radio de 20px con anillo `--border-control`.
- [x] **Componentes nuevos:**
  - `OptionRows`: "filas de opción", con ilustración y check.
  - `CurrencyPicker`: `radiogroup` en cuadrícula de 4, con las 7 monedas.
  - Ya se usan en el onboarding actual y en Ajustes del hogar. Se borró `RadioCardGroup`, que quedó sin uso.
- [x] **Textos de los modos de reparto** según tu definición: proporcional al ingreso, cada uno la mitad, o todo en conjunto.
- [x] **`ItemCard`:**
  - Ícono de 28px + nombre `--text-lg` arriba; avatares de 28px arriba a la derecha.
  - Monto `--text-4xl` a la derecha; estrella de cuenta principal (lista para R6).
  - Deudas: barra de 6px y "cuota · N pagos".
  - Hover con `--shadow-card-hover`.
  - La grilla pasa a una tarjeta por fila en el teléfono.
- [x] **`HouseholdAvatars`:** iniciales sobre `--person-a` / `--person-b`, solapados, con anillo `--avatar-ring`.
  - El orden sale de la fecha de registro (`useHouseholdMembers` ahora trae `created_at`).
  - Reemplaza al avatar de la tarjeta. `AvatarPair` sigue en el onboarding hasta R5.
- [x] **`SectionHeader`:** sin plegado; título `--text-xl` bold, total `--text-primary`, botón + circular y divisor.
- [x] **Lista de inversiones** (`InvestmentList`): filas con nombre, fecha, valor y variación con signo. Los grupos, con su cuadro de ícono, llegan en R6.
- [x] **Barras de presupuesto:** se mantiene el aviso en tres pasos de `BudgetList` (turquesa, aviso al 80% y magenta al pasarse). DESIGN.md se actualizó para describirlo.
- [x] **Diálogo:** tirador de 36×4px en la hoja inferior (solo en móvil); el velo ya cerraba al tocarlo.
- [x] **Íconos nuevos** en `icons.tsx` (grilla de 20): flecha a la izquierda, check, cuatro puntos, móvil, QR, globo de chat, diana, dinero y estrella rellena. Se reusan los que ya existían: casa, barras, tarjeta, banco, rayo, tendencia, copiar y flecha a la derecha.
- [x] **`Logo`** como componente SVG con `currentColor`, en el login, el encabezado y la bienvenida. Se quitaron los `filter: invert(1)`.
- [x] **Ilustraciones** en `src/components/illustrations/`:
  - `AccountTypeIllustration`, ya en el onboarding.
  - `DoneIllustration`: la casa y la moneda, extraídas del artefacto, con trazos en `currentColor` y la flotación limitada a menos de 5 s.
- [x] **Esqueletos de carga** al alto real de la tarjeta nueva (150px); en inversiones, filas.
- [x] Build y lint. Revisión con Playwright en claro y oscuro a 390px, en una página temporal (ya borrada): sin errores de consola. Corregido al revisar: el anillo de los avatares en oscuro.
- [x] Iniciales de dos letras siempre: nombre y apellido (MF, MP), o las dos primeras letras si solo hay nombre. El registro pide "Nombre y apellido".
- [ ] Revisión visual tuya en la app (`npm run dev`).
- [x] Commit.
- Se movieron a su etapa: el **botón flotante** a R4, donde se usa, y la **píldora de porcentaje** a R6 (hoja de composición).

### Código de invitación de 8 caracteres 🟨
Pedido el 2026-09-28: el código de 36 caracteres no se podía dictar.
- [x] Migración `20260928204816_household_invite_code.sql`: columna `invite_code` (única, con formato validado) y función `join_household`.
- [x] Probada en un Postgres real (PGlite) con las tablas y policies de la migración base:
  - Los hogares existentes reciben código al migrar, y 2000 códigos generados salen sin repetidos.
  - Se puede unir con minúsculas y guion.
  - Un código inexistente, alguien que ya tiene hogar y un hogar lleno dan cada uno su error.
  - Un usuario sin sesión no puede ejecutar la función, y nadie ve los códigos de otros hogares.
- [x] App: `lib/inviteCode.ts` (normalizar, mostrar como `XXXX-XXXX` y unirse con mensajes según la causa); onboarding, "Invitar a tu pareja", link `/unirse/:code` y unión automática desde el link.
- [ ] **Correr la migración en el SQL Editor de Supabase.** Sin eso, crear un hogar y unirse fallan.
- [ ] Revisar los avisos de seguridad del proyecto en Supabase (Advisors) después de correrla.
- [ ] Verificar en vivo: crear en pareja, compartir el código y que la otra persona se una escribiéndolo y desde el QR.

### R4 — Estructura de la app ⬜
- [ ] **Navegación inferior de 5 pestañas:** Resumen, Patrimonio, Presupuesto, Movimientos y Ver más.
  - Estadísticas desaparece (página, ruta y enlace).
  - "Ver más" sigue con Categorías, Ajustes del hogar e Invitar.
- [ ] **Pestañas:**
  - Activa: ícono `--brand-strong`, etiqueta bold y punto de 4px.
  - Inactiva: `--text-muted`.
  - En escritorio, las mismas 5 en el encabezado.
- [ ] **Cabecera `--surface-header`** en las 5 pestañas:
  - Selector de vista, sin chevron hasta que tenga función.
  - Cambio de tema a la derecha (34px, zona de 44px).
  - Borde inferior en oscuro y `--focus-ring` blanco.
  - `AppShell` pasa a `useThemeColor('--surface-header')`.
- [ ] **Botón flotante** (componente: 52px, degradado, `--shadow-brand`) en Resumen ("Añadir movimiento") y en Patrimonio ("Añadir cuenta, deuda o inversión").
- [ ] **Títulos:** `<h1>` oculto en Resumen y Patrimonio; `useDocumentTitle` con los nombres nuevos.
- [ ] **Login, registro, contraseñas y 404, con glassmorfismo** (decisión 9, DESIGN.md § Fondo — pantallas de autenticación):
  - Fondo con tres manchas (aguamarina, morado y cian) sobre `#F8FAFC` en claro y azul marino `#0B1120` en oscuro.
  - Tarjeta de vidrio: blanco al 72% en claro, azul marino al 65% en oscuro, con `blur(24px)`. Sin soporte de `backdrop-filter`, cae a sólido.
  - Enlaces dentro de la tarjeta en `--text-secondary`.
  - Ondas en `--brand` al 20%.
  - Se borran `login-background.webp` y `login-background-dark.webp`, con sus referencias y el precache.
- [ ] **Bienvenida:**
  - Recolorear `welcome-hero.webp` con un mapa de degradado por luminosidad (azul marino → morado → aguamarina). Se revisa contigo antes de reemplazar la original.
  - WebP calidad 90, y verificar un recorte ampliado contra el original.
  - Color de respaldo = el promedio de la imagen nueva.
- [ ] **Textos que nombran pantallas:** "Ir a Finanzas" → "Ir a Patrimonio" (estados vacíos de Movimientos y Dashboard).
- [ ] **Rutas nuevas** (decisión 10): `/resumen`, `/patrimonio`, `/presupuesto`, `/movimientos` y `/mas`. Siguen igual `/categorias`, `/ajustes` e `/invitar`.
  - El inicio pasa a ser `/resumen`.
  - Redirecciones: `/dashboard` → `/resumen`, `/mover` → `/movimientos`, `/estadisticas` → `/resumen`.
  - Todos los usos de las rutas viejas se actualizan: `App.tsx`, `AppShell.tsx`, `SocialAuthButtons.tsx` (`redirectTo`), `Login.tsx`, `JoinRedirect.tsx`, `ResetPassword.tsx`, `Welcome.tsx`, `Transactions.tsx`, `Dashboard.tsx` y `Statistics.tsx` (este se borra).
  - **Fuera del código:** en Supabase → Authentication → URL Configuration, agregar `…/resumen` a las Redirect URLs, salvo que ya haya un comodín (`/**`). Si no, el login con Google y Apple falla al volver.

### R5 — Onboarding nuevo ⬜
- [ ] **Layout:**
  - Fondo de manchas; encabezado con "Volver" y el logo.
  - Barra de línea con punto (`role="progressbar"`, "Paso 2 de 3") y número de paso decorativo.
  - Título `--text-3xl` + ayuda; CTA a todo el ancho con flecha.
  - Reemplaza `OnboardingLayout`, `SegmentedProgress` y `AvatarPair`.
- [ ] **Recorridos:** Solo yo (tipo y nombre → moneda), Crear en pareja (tipo y nombre → invitación → moneda y reparto) y Unirse (tipo → código). La barra se calcula sobre el recorrido elegido.
- [ ] **Paso 1, tipo y nombre:** dos filas de opción con ilustración de 72px y, debajo, el campo subrayado del nombre. "Continuar" crea el hogar (decisión 2).
- [ ] **Paso 2, invitación** (solo pareja): bloque de invitación.
  - Código monoespaciado.
  - Acciones: "Copiar" (anunciado con `aria-live`), "WhatsApp" (`wa.me`) y "Ver QR" en un diálogo.
  - Invitar es opcional: "Continuar" sigue igual.
- [ ] **Paso código:** solo el campo de código, sin escáner (decisión 3).
- [ ] **Paso moneda y reparto:** selector de moneda y tarjetas de reparto (Proporcional, Indiferente, 50 / 50).
- [ ] **Pantalla final:**
  - Ilustración con sus animaciones, confeti y tres funciones; CTA "Ir a mi hogar".
  - Con reducir movimiento, sin desplazamientos; bucles de menos de 5 s.
- [ ] **Verificar en vivo los tres recorridos.** Incluye el pendiente de la Fase 0.5: crear en pareja, compartir el QR y que la segunda persona quede unida.

### R6 — Patrimonio ⬜
- [ ] **Cabecera:**
  - Total en `--text-4xl`.
  - Barra de composición: segmentos separados 2px; es un botón y cada segmento abre su grupo.
  - Chevron de pista (2 veces).
- [ ] **Hoja "Composición del patrimonio"** (un `Dialog` más): la fila destacada con fondo y escala 1.02, sin atenuar las demás.
- [ ] **Píldora de porcentaje** (componente): fondo con el tinte de la serie, texto normal. También la usa la historia 2 de R7.
- [ ] **Cuentas y Deudas:**
  - Tarjetas nuevas con efecto de apilado al hacer scroll (`transform` en scroll pasivo, no `sticky`).
  - Con reducir movimiento, sin apilado; `scroll-margin` para el foco con teclado.
- [ ] **Inversiones** en lista agrupada (DESIGN.md § Lista de inversiones).
- [ ] **Cuenta principal** (decisión 7):
  - Migración: `accounts.is_primary boolean not null default false`, con un índice único parcial para que haya una sola por hogar.
  - Se elige en el formulario de la cuenta y se muestra con la estrella.
- [ ] **Grupos de inversiones** (decisión 7):
  - Migración: tabla `investment_groups` (nombre, ícono, variante de color, `archived_at`, con el patrón de RLS de siempre) e `investments.group_id` nullable (`on delete set null`).
  - Formulario de grupo; la inversión elige su grupo.
  - La variante de color pasa al grupo: `investments.color_variant` deja de usarse (se puede quitar después).
- [ ] **Eliminar los gráficos** (decisión 1):
  - `CategoryBreakdownChart`, `IncomeVsExpenseChart`, `NetWorthTrendChart` y `tooltipFormat.ts`.
  - La parte de `useDashboardCharts` que solo los alimenta.
  - La dependencia `recharts` en `package.json`.
- [ ] `Dashboard.tsx` pasa a ser la pantalla Patrimonio.
- [ ] Antes de escribir las migraciones, cargar la skill `supabase-postgres-best-practices`.

### R7 — Resumen (historias) ⬜
- [ ] **Estructura:**
  - 3 historias en pareja; 2 en un hogar de una persona o con reparto "Indiferente", porque no hay nada que consolidar. El prototipo mostraba la historia 2 también en individual: era un error. Metas espera (decisión 6).
  - Un `<button>` real que cubre el área; flechas del teclado; título anunciado con `aria-live`.
  - Indicador de segmentos y número decorativo.
- [ ] **Navegador de mes:** los datos de las historias son del mes elegido.
- [ ] **Historia 1, Ingresos vs. gastos:** anillo con arcos separados, balance que cuenta hasta el valor y tarjetas de vidrio.
- [ ] **Historia 2, Gastos compartidos** (oscura en ambos modos): semicírculo por persona, "por saldar", tarjeta por persona y "Saldar".
  - El cálculo está en DESIGN.md § Resumen (decisión 4): gastos sin titular del mes; quién pagó según el dueño de la cuenta; parte de cada uno según `expense_split`; proporcional por los ingresos del mes, con 50 / 50 si falta alguno.
  - No necesita columnas nuevas: `memberId` vacío ya marca un gasto como compartido, y `ownerId` de la cuenta dice quién pagó.
- [ ] **"Saldar"**, con el modelo propuesto (se confirma al empezar R7, con la skill `supabase-postgres-best-practices`):
  - **Transferencia:** dos movimientos enlazados, la salida de la cuenta de quien debe y la entrada en la de quien pagó de más. Mueven los saldos de las cuentas, pero no cuentan como ingreso ni como gasto (ni en el Resumen, ni en los presupuestos, ni en el reparto). Columnas nuevas en `transactions`: `kind` (`'movement'` | `'transfer'`) y `transfer_id`.
  - **Registro del saldo:** tabla `settlements` (hogar, mes, de quién, a quién, monto y la transferencia). Con el mes saldado por el total, la historia muestra "Saldado".
  - **Formulario "Saldar":** monto pendiente ya puesto, cuenta de origen y de destino.
  - **Movimientos:** la lista muestra las transferencias como tales, no como un gasto y un ingreso.
- [ ] **Historia 3, Presupuestos** (decisión 5): barra "Gasto" (total de los presupuestos de gasto del mes) y las dos categorías con presupuesto más cerca de su límite. Sin presupuestos, un estado vacío con "Crear el primero".
- [ ] **Animaciones de las excepciones de DESIGN.md:**
  - Con reducir movimiento: sin desplazamientos, y los números muestran directo el valor final.
  - El conteo actualiza el nodo, no hace render, y el valor final es accesible desde el primer momento.
- [ ] **Resumen en texto** (`visually-hidden`) de cada gráfico.

### R8 — Limpieza y verificación final ⬜
- [ ] **Borrar lo que quede sin uso:**
  - Página de Estadísticas.
  - `SegmentedProgress`, `AvatarPair`, `InviteCodeBadge` (si el bloque de invitación de R5 lo reemplaza).
  - `public/logo.svg`, que ya no se usa (el logo es un componente).
  - Tokens sin consumidores.
- [ ] **Verificar con Playwright en claro y oscuro a 390px, en todas las pantallas:** contraste, foco visible y áreas táctiles.
- [ ] **Lector de pantalla:** historias, cabecera, grupos de opciones y barra de composición.
- [ ] **Actualizar "Estado actual"** de este README, y DESIGN.md si algo cambió al implementar.

### Decisiones
Se cierran antes de la etapa que las necesita. Todas resueltas el 2026-09-28.

1. ✅ **Gráficos actuales** ("Evolución del patrimonio", "Gastos por categoría" e "Ingresos vs. gastos"): se eliminan, y con ellos recharts. *(R6)*
2. ✅ **Código de invitación:** el nombre va en el paso 1, que crea el hogar al continuar; la invitación va en el paso 2. Así se mantiene la regla de la Fase 0.5: el código solo se muestra cuando el hogar ya existe. *(R5)*
3. ✅ **Escanear QR dentro de la app:** no se implementa. Basta con el link `/unirse/<id>`, que abre la cámara del teléfono. *(R5)*
4. ✅ **Gastos compartidos y "Saldar":** en el onboarding se elige cómo repartir. Hay gastos individuales y compartidos; el total compartido del mes se reparte entre los dos, y si uno pagó de más, el otro le transfiere la diferencia con "Saldar". Según el modo:
   - **Proporcional:** los gastos compartidos se dividen en proporción al ingreso de cada uno.
   - **50 / 50:** cada uno paga la mitad.
   - **Indiferente:** no hay consolidación; la historia 2 no aparece.

   Un hogar individual tampoco la tiene. El cálculo está en DESIGN.md § Resumen, y el modelo de datos en R7. *(R7)*
5. ✅ **Presupuestos de Inversión y Deuda:** esperan (ver "Diferido del rediseño"). Mientras tanto, la historia 3 muestra la barra "Gasto" y las dos categorías más cerca de su límite. *(R7)*
6. ✅ **Metas:** espera. La historia 4 queda diseñada en DESIGN.md, sin implementar (ver "Diferido del rediseño"). *(R7)*
7. ✅ **Cuenta principal y grupos de inversiones:** se agregan al modelo. *(R6)*
8. ✅ **Selector de vista de la cabecera:** por ahora es solo un título con los avatares ("Nuestro resumen"), sin flechita ni menú. El filtro por persona espera (ver "Diferido del rediseño"). *(R4)*
9. ✅ **Login y bienvenida:** el login pasa a glassmorfismo en aguamarina y morado, con versión clara y oscura (azul marino). La bienvenida mantiene su imagen, recoloreada a azul marino, morado y aguamarina. *(R4)*
10. ✅ **Nombres de las rutas:** `/resumen`, `/patrimonio`, `/presupuesto`, `/movimientos` y `/mas`, con redirecciones desde `/dashboard`, `/mover` y `/estadisticas`. Se actualizan en todo el código (lista en R4). *(R4)*

### Diferido del rediseño
Decidido esperar; no entra en R1–R8.
- **Metas:** módulo nuevo (tabla `goals` con RLS, `src/features/goals/`, formulario) y la historia 4 del Resumen, ya diseñada en DESIGN.md.
- **Presupuestos de Inversión y Deuda:** es un módulo propio. Hay que definir qué se presupuesta en una deuda o una inversión, de dónde sale lo pagado o invertido en el mes, el formulario y la migración. Cuando exista, reemplaza a las dos barras de categorías de la historia 3.
- **Filtro por persona en la cabecera:** "Nuestro resumen" / "Mi resumen" / el de la otra persona.

---

## Convenciones transversales (aplican a todas las fases)

**RLS**: todas las tablas nuevas o alteradas usan exactamente el patrón ya establecido en la migración base — `enable row level security` + una sola policy `for all to authenticated using (household_id = public.current_household_id()) with check (...)`. No se repite en cada fase salvo que un módulo necesite algo distinto (ninguno lo necesita).

**Timestamps**: toda tabla nueva/alterada tiene `created_at timestamptz not null default now()` y `updated_at timestamptz not null default now()`, con un trigger compartido (se crea una vez en la Fase 0, se reutiliza en cada tabla):

```sql
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- por tabla:
create trigger set_<tabla>_updated_at
  before update on public.<tabla>
  for each row execute function public.set_updated_at();
```

**Archivado**: donde aplica (Cuentas, Deudas, Inversiones, Categorías) es `archived_at timestamptz` nullable — `null` = activa, con fecha = archivada. "Archivar" es un `update` (`archived_at = now()`), no un `delete`; "eliminar" sigue siendo un `delete` real, con confirmación. Las vistas de lista filtran `archived_at is null` por defecto, con un toggle "ver archivadas".

**Mapeo snake_case ↔ camelCase**: la base de datos usa `snake_case` (ya establecido). Cada `src/features/<módulo>/api.ts` mapea filas de Supabase a los tipos de dominio en `camelCase` (igual que ya están definidos `Account`, `Debt`, etc. en `src/types/domain.ts`) — el resto de la app nunca ve `snake_case`.

**Estructura por módulo** (`src/features/<módulo>/`, según `src/features/README.md`):
```
<módulo>/
  api.ts          # queries/mutations a Supabase — única capa que toca lib/supabase
  use<Módulo>.ts  # hook de datos (fetch + estado) que consume la UI
  <Módulo>Form.tsx
  <Módulo>Card.tsx     # cuando no basta con ItemCard genérico
```

**Iconos existentes a reutilizar**: `BankIcon`, `CardIcon`, `TrendUpIcon`, `PiggyIcon` ya están escritos inline en `Dashboard.tsx`; `WalletIcon`, `PieChartIcon`, `SwapIcon`, `BarChartIcon`, `MoreIcon` en `AppShell.tsx`. Antes de crear íconos nuevos para los selectores de ícono (Cuentas/Deudas/Categorías), la Fase 0 los extrae a `src/components/ui/icons.tsx` como un registro `{ key: string, label: string, Icon: ... }[]` — se reutilizan ahí y en los pickers, en vez de duplicarlos.

---

## Fase 0 — Fundamentos compartidos ✅

Construido:

1. **`Dialog`** (`src/components/ui/Dialog.tsx`): portal a `document.body`, cierra con `Esc` y clic en el fondo, bloquea el scroll del body mientras está abierto, enfoca el primer campo al abrir. En móvil se comporta como hoja inferior (`border-radius` solo arriba); desde 640px es un modal centrado — mismo patrón "app-like" que ya usa el resto de la interfaz.
2. **`ConfirmDialog`**: envoltorio sobre `Dialog` con dos tonos deliberadamente distintos — `tone="archive"` (botón neutro, acción reversible) y `tone="delete"` (botón en `--loss-color`, acción permanente). En una app de plata compartida esa distinción de confianza importa tanto como la función: "archivar" nunca debe verse tan alarmante como "eliminar", o la gente deja de archivar por miedo.
3. **Primitivos de formulario**: `TextField`, `Select` (con `MemberSelect` construido encima), `IconPicker` y `ColorPicker` sobre una grilla compartida (`Picker.module.css`); todos con el mismo `formField.module.css` (44px, `--surface-sunken`, `--radius-control`) ya probado en las pantallas de auth.
4. **`NumberField`**: pensado para CLP (enteros, sin centavos, como ya define `formatCurrency`/`formatAmount`) — mientras el campo tiene foco muestra los dígitos crudos para editar cómodo; al perder el foco formatea con separador de miles (`75000` → `75.000`) y antepone `$`. `min`/`max` opcionales se aplican al perder el foco.
5. **`components/ui/icons.tsx`**: registro compartido `IconKey → componente` (`bank`, `cash`, `card`, `wallet`, `piggy`, `trend-up`) — `Dashboard.tsx` ya importa desde aquí en vez de definir los íconos localmente.
6. **`useHouseholdMembers` + `MemberSelect`** (no estaba en el plan original, se agregó al construir): el selector de "titular" — compartido/ambos + cada miembro del household — es el mismo dato en Cuentas, Deudas, Inversiones (`ownerId`) y Transacciones (`memberId`); en vez de repetirlo en las 4 fases siguientes, salió una sola vez ahora. El hook no filtra `household_id` a mano: la policy `profiles_select_self_or_household` ya limita el resultado a "yo + mi pareja", así que solo pide `select * from profiles`.
7. **`set_updated_at()`** — trigger compartido, incluido en `supabase/migrations/20260902204206_baseline_schema.sql` (la migración base, que documenta el punto de partida — ya aplicada).

**Componentes**: `Dialog.tsx`, `ConfirmDialog.tsx`, `TextField.tsx`, `NumberField.tsx`, `Select.tsx`, `MemberSelect.tsx`, `IconPicker.tsx`, `ColorPicker.tsx`, `components/ui/icons.tsx`. **Hooks**: `useHouseholdMembers.ts`. Todo verificado visualmente (claro/oscuro, móvil/escritorio) antes de integrarlo.

---

## Fase 1 — Categorías de gastos e ingresos ✅

### Esquema (extiende `categories`, hoy solo tiene `id, household_id, name, created_at`)

```sql
alter table public.categories
  add column type text not null default 'expense' check (type in ('expense', 'income')),
  add column icon text not null default 'other',
  add column color text not null default 'green' check (color in ('green', 'purple', 'coral', 'pink')),
  add column archived_at timestamptz,
  add column updated_at timestamptz not null default now();

create trigger set_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create index categories_household_type_idx on public.categories (household_id, type) where archived_at is null;
```

`color` reutiliza las 4 familias de tono ya definidas en `tokens.css` (`green` → `--account-a-*`, `purple` → `--account-b-*`/`--investment-*`, `coral` → `--debt-a-*`, `pink` → `--debt-b-*`) — cero colores nuevos. `icon` es una clave del registro de íconos de la Fase 0; set inicial sugerido: `groceries, home, transport, salary, entertainment, health, education, gifts, subscriptions, other`.

### RLS
Patrón estándar (ya aplicado a `categories`, no cambia).

### Tipos TS (`src/types/domain.ts`)

```ts
export type CategoryType = 'expense' | 'income'
export type CategoryColor = 'green' | 'purple' | 'coral' | 'pink'

export interface ExpenseCategory {
  id: string
  householdId: string
  name: string
  type: CategoryType
  icon: string
  color: CategoryColor
  archivedAt: string | null
  createdAt: string
  updatedAt: string
}
```

(Se renombra el `Category`/`CATEGORIES` actual de `domain.ts` — hoy es un concepto distinto, las 4 secciones del dashboard — para no chocar de nombre; se decide el nombre final al implementar.)

### Componentes
Nuevos: `CategoryList.tsx` (agrupada por tipo, gasto/ingreso), `CategoryForm.tsx` (nombre + `IconPicker` + `ColorPicker` + toggle tipo), reutiliza `ConfirmDialog`. No reutiliza `ItemCard` (esa tarjeta es específica de cuentas/deudas/inversiones con monto grande) — fila simple: ícono + nombre + acciones.

---

## Fase 2 — Cuentas ✅

### Esquema (extiende `accounts`)

```sql
alter table public.accounts
  add column initial_balance numeric(14, 2) not null default 0,
  add column icon text not null default 'bank',
  add column color_variant text not null default 'a' check (color_variant in ('a', 'b')),
  add column archived_at timestamptz,
  add column updated_at timestamptz not null default now();

create trigger set_accounts_updated_at
  before update on public.accounts
  for each row execute function public.set_updated_at();
```

`balance` (ya existe) pasa a ser una columna **derivada y mantenida por trigger** desde la Fase 5 (Transacciones) — hasta entonces se inicializa igual a `initial_balance` al crear la cuenta y se edita solo si el usuario corrige el saldo inicial manualmente. `color_variant` alimenta directo el `ItemVariant` que ya existe en `ItemCard` (`account-a` / `account-b`).

### RLS
Patrón estándar (ya aplicado).

### Tipos TS
Extiende el `Account` existente en `domain.ts` con `initialBalance`, `icon`, `colorVariant: 'a' | 'b'`, `archivedAt`, `updatedAt`.

### Componentes
Nuevos: `AccountForm.tsx` (nombre, titular vía `Select` de miembros del household + opción "compartida", saldo inicial, `IconPicker`, `ColorPicker` limitado a a/b). Reutiliza: `ItemCard` (ya soporta ícono, variante de color y avatar de titular — solo cambia de `MOCK` a datos reales), `ConfirmDialog` para archivar/eliminar. Nuevo `AccountsSection.tsx` en el Dashboard reemplaza el bloque `MOCK.accounts` actual.

---

## Fase 3 — Deudas ✅

### Esquema (extiende `debts`)

```sql
alter table public.debts
  add column icon text not null default 'card',
  add column color_variant text not null default 'a' check (color_variant in ('a', 'b')),
  add column installment_amount numeric(14, 2),
  add column installments_remaining integer check (installments_remaining >= 0),
  add column archived_at timestamptz,
  add column updated_at timestamptz not null default now();

create trigger set_debts_updated_at
  before update on public.debts
  for each row execute function public.set_updated_at();
```

`principal` y `remaining` ya existen y cubren "monto total"/"saldo actual". `interest_rate` y `due_date` (ya existentes) se mantienen — no pedidos en este pase pero no estorban, se dejan como opcionales. `installment_amount`/`installments_remaining` son nuevos y opcionales (no toda deuda tiene cuotas fijas — ej. una tarjeta de crédito revolvente).

### RLS
Patrón estándar (ya aplicado).

### Tipos TS
Extiende `Debt` con `icon`, `colorVariant`, `installmentAmount: number | null`, `installmentsRemaining: number | null`, `archivedAt`, `updatedAt`.

### Componentes
Nuevos: `DebtForm.tsx`. Reutiliza: `ItemCard` (ya calcula y muestra `progress` con `ProgressBar` — hoy en el Dashboard el progreso sale de `(principal - remaining) / principal`, se mantiene igual con datos reales), `ConfirmDialog`. `DebtsSection.tsx` reemplaza `MOCK.debts`.

---

## Fase 4 — Inversiones ✅

**Resuelta la nota de diseño abierta**: inversiones sí rota color `a`/`b` como cuentas y deudas — se agregó `--investment-b-bg`/`--investment-b-text` a `tokens.css` reutilizando el verde de `--account-a` (mismos valores, cero color nuevo) y `--investment-bg`/`--investment-text` se renombraron a `--investment-a-bg`/`--investment-a-text` por simetría. `ItemVariant` pasó de `'investment'` a `'investment-a' | 'investment-b'` (`ItemCard.module.css` y los 2 usos en `Dashboard.tsx` — el de Ahorro, que sigue en `MOCK` — se actualizaron).

### Esquema (extiende `investments`)

```sql
alter table public.investments
  add column icon text not null default 'trend-up',
  add column color_variant text not null default 'a' check (color_variant in ('a', 'b')),
  add column invested_at date not null default current_date,
  add column archived_at timestamptz,
  add column updated_at timestamptz not null default now();

create trigger set_investments_updated_at
  before update on public.investments
  for each row execute function public.set_updated_at();

create index investments_household_active_idx on public.investments (household_id) where archived_at is null;
```

`invested` y `current_value` ya existen. `owner_id` ya existe (no estaba en la lista de campos del pedido pero se mantiene — quitarlo sería una regresión sin motivo).

### RLS
Patrón estándar (ya aplicado).

### Tipos TS
Extiende `Investment` con `icon`, `colorVariant`, `investedAt: string`, `archivedAt`, `updatedAt`.

### Componentes
Nuevos: `InvestmentForm.tsx` (incluye fecha de inversión, `type="date"`). Reutiliza: `ItemCard`, `ConfirmDialog`, `ArchivedList`/`ArchivedToggle`. `InvestmentsSection.tsx` reemplaza `MOCK.investments` en el Dashboard.

---

## Fase 5 — Registro de transacciones ✅

### Esquema (extiende `transactions`)

```sql
alter table public.transactions
  alter column description drop not null,        -- "nota opcional"
  add column member_id uuid references public.profiles (id) on delete set null, -- titular; null = ambos
  add column created_at timestamptz not null default now(),
  add column updated_at timestamptz not null default now(),
  add constraint transactions_amount_not_zero check (amount <> 0);

create trigger set_transactions_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

create index transactions_member_id_idx on public.transactions (member_id);
```

(`created_at` se agregó al construir — no estaba en el borrador original del plan pero todas las demás tablas lo tienen, y la definición de `Transaction` en TS ya lo esperaba.)

`member_id` ("titular: quién lo hizo") es **distinto** de `created_by` (quién registró el movimiento en la app, ya existente — se conserva como dato de auditoría; en la práctica casi siempre coinciden, pero permite que Mery registre un gasto y lo asigne a su pareja). El "tipo" (ingreso/gasto) no es una columna nueva: se sigue infiriendo del signo de `amount` (ya es la convención documentada) — un `check` evita `amount = 0`.

### Integridad del saldo de la cuenta (la pieza central de esta fase)

El saldo de `accounts.balance` deja de tocarse manualmente y pasa a mantenerse **con un trigger en Postgres**, no en el cliente. Motivo: dos personas pueden registrar movimientos casi al mismo tiempo desde distintos dispositivos — un `UPDATE accounts SET balance = balance + :delta` dentro de un trigger es atómico y serializa correctamente esas escrituras concurrentes (bloqueo de fila de Postgres); replicar la misma lógica en el cliente (leer saldo, sumar, guardar) es vulnerable a *lost updates* y además duplicaría la lógica en tres sitios (crear/editar/eliminar).

```sql
create or replace function public.apply_transaction_to_balance()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if TG_OP = 'INSERT' then
    update public.accounts set balance = balance + new.amount where id = new.account_id;

  elsif TG_OP = 'DELETE' then
    update public.accounts set balance = balance - old.amount where id = old.account_id;

  elsif TG_OP = 'UPDATE' then
    if new.account_id = old.account_id then
      update public.accounts set balance = balance + (new.amount - old.amount) where id = new.account_id;
    else
      -- Dos cuentas distintas: bloquéalas primero en un orden fijo (por id).
      -- Sin esto, dos ediciones concurrentes que mueven plata entre las
      -- mismas dos cuentas en sentido contrario pueden hacer deadlock al
      -- tomar los locks en orden inverso una de la otra.
      perform 1 from public.accounts where id in (old.account_id, new.account_id) order by id for update;
      update public.accounts set balance = balance - old.amount where id = old.account_id;
      update public.accounts set balance = balance + new.amount where id = new.account_id;
    end if;
  end if;

  return null; -- trigger AFTER, el valor de retorno se ignora
end;
$$;

create trigger transactions_apply_balance
  after insert or update or delete on public.transactions
  for each row execute function public.apply_transaction_to_balance();
```

**Ajuste agregado al construir, consultando la guía de buenas prácticas de Postgres de Supabase**: el borrador original hacía los dos `update` (restar de la cuenta vieja, sumar a la nueva) sin bloquear antes — exactamente el patrón de deadlock por orden de bloqueo inconsistente que la guía marca como error común. El `perform ... for update` de arriba lo evita.

Regla derivada: una vez creada la cuenta, `balance` **nunca se edita a mano desde la UI** — solo `initial_balance` es editable manualmente (y su cambio no re-dispara el trigger de transacciones); si alguna vez se sospecha de un desfase, la reconciliación es un script de una sola vez: `balance = initial_balance + (select coalesce(sum(amount),0) from transactions where account_id = ...)`.

### RLS
Patrón estándar. El trigger de balance corre `security invoker` (explícito): dueño de la tabla `transactions`, no necesita bypass de RLS porque solo escribe en `accounts` del mismo household, ya alcanzable por la policy de `accounts`.

### Tipos TS
```ts
export interface Transaction {
  id: string
  householdId: string
  accountId: string
  categoryId: string | null
  memberId: string | null // titular; null = ambos
  createdBy: string
  amount: number // negativo = gasto, positivo = ingreso
  description: string | null
  occurredAt: string
  createdAt: string
  updatedAt: string
}

export interface TransactionFilters {
  accountId?: string
  categoryId?: string
  memberId?: string
  from?: string
  to?: string
}
```

### Componentes
Nuevos: `TransactionForm.tsx` (tipo ingreso/gasto vía `TypeToggle` compartido — ver abajo —, monto, `Select` de cuenta, `Select` de categoría filtrado por tipo, `MemberSelect` con "Ambos", fecha, nota opcional), `TransactionList.tsx` (agrupada por día, monto en `--gain-color`/`--loss-color` según el signo), `TransactionFiltersBar.tsx` (los 4 filtros pedidos). Reutiliza `ConfirmDialog` para eliminar. Editar reabre `TransactionForm` con los valores existentes — el `UPDATE` deja que el trigger reajuste el saldo (incluido el caso de cambiar de cuenta).

**Página**: `pages/Transactions.tsx` en `/mover` (el ítem de navegación "Mover" del `AppShell`, hasta ahora un placeholder). El card "Últimos movimientos" del Dashboard ahora muestra los últimos 5 movimientos reales en vez del mensaje estático.

**Refactor de paso**: el toggle Gasto/Ingreso de `CategoryForm` (Fase 1) se usaba también aquí, así que salió a un componente compartido `components/ui/TypeToggle.tsx` en vez de duplicarse.

---

## Fase 6 — Presupuestos ✅

**Resuelta la pregunta abierta**: presupuesto es siempre del mes actual (no se puede planear meses futuros/pasados) y cero-based (sin traspaso de sobrante al mes siguiente) — la opción más simple que ya recomendaba el plan.

**Ampliado a pedido**: el plan original solo contemplaba presupuestos de categorías `expense` ("un presupuesto es... solo tiene sentido para categorías de tipo expense"). Ahora también se pueden crear para categorías `income` — mismo mecanismo, semántica distinta: un presupuesto de gasto es un límite a no superar, uno de ingreso es una meta a alcanzar. Esto cambió tres cosas:
- `BudgetForm`: al crear, un `TypeToggle` (Gasto/Ingreso — el mismo componente de `CategoryForm`) filtra qué categorías ofrece el `Select`; cambiar de tipo limpia la categoría elegida (ya no sería válida para el otro tipo). Al editar no se muestra el toggle — la categoría queda fija, mostrada como texto. La etiqueta del monto cambia sola ("Monto límite" / "Meta de ingreso") según el tipo activo.
- `useBudgets`: el cálculo de `spent` ya no filtra por `amount < 0` — suma el valor absoluto de toda transacción categorizada, gasto o ingreso (cada categoría es de un solo tipo, así que el signo ya es correcto por construcción).
- `BudgetList`: el color de la barra se invierte para ingresos — sin estado de alarma por no alcanzar la meta (sería engañoso, no es algo que se "sobre-gaste"), verde al alcanzarla o superarla.

**Bug encontrado al probar en vivo (corregido, sin migración nueva)**: en `BudgetForm`, el `Select` de categoría se inicializaba con `useState(... ?? available[0]?.id ?? '')`. Como `useCategories()` carga async, en el primer render `available` está vacío y `categoryId` queda pegado en `''` para siempre — `useState` solo evalúa esa expresión una vez, no se recalcula cuando las categorías llegan después. El `<select>` del navegador mostraba igual la primera opción (por defecto cuando el `value` no calza con ninguna), así que visualmente parecía elegido, pero el botón "Guardar" seguía deshabilitado (`!categoryId`). Se corrigió guardando `null` (= "todavía no tocado por el usuario") y derivando el valor efectivo en cada render (`categoryId ?? available[0]?.id ?? ''`) en vez de capturarlo una sola vez. El mismo patrón exacto existía en `TransactionForm` (cuenta, con `useAccounts()`) y se corrigió igual. Al agregar el `TypeToggle` de arriba reincidí en el mismo error con `type` (derivado de `initialCategory?.type`, que también depende de `categories` cargando) — esta vez lo agarré antes de terminar, mismo arreglo (`typeChoice: CategoryType | null` + derivar `type` en cada render).

### Esquema (tabla nueva)

```sql
create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  period_month date not null, -- siempre día 1 del mes, ej. 2026-09-01
  amount numeric(14, 2) not null check (amount > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, category_id, period_month)
);

create index budgets_household_period_idx on public.budgets (household_id, period_month);

alter table public.budgets enable row level security;

create trigger set_budgets_updated_at
  before update on public.budgets
  for each row execute function public.set_updated_at();

create policy "budgets_all_household"
on public.budgets for all
to authenticated
using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());
```

Un presupuesto es por `(categoría, mes)` — se puede subir el límite de un mes puntual sin afectar los demás. Solo tiene sentido para categorías de tipo `expense`.

### Cálculo del progreso (tiempo real)

Sin tabla ni vista adicional para v1: el hook `useBudgets` pide en paralelo (a) los presupuestos del mes en curso y (b) las transacciones de gasto del mes en curso, y reduce en el cliente:

```ts
const spentByCategory = transactions
  .filter((t) => t.amount < 0)
  .reduce<Record<string, number>>((acc, t) => {
    if (!t.categoryId) return acc
    acc[t.categoryId] = (acc[t.categoryId] ?? 0) + Math.abs(t.amount)
    return acc
  }, {})

const progress = budgets.map((b) => ({
  ...b,
  spent: spentByCategory[b.categoryId] ?? 0,
  ratio: (spentByCategory[b.categoryId] ?? 0) / b.amount,
}))
```

Si el volumen de transacciones crece mucho, esto se puede mover a una vista Postgres (`security invoker`) que haga el `group by` en el servidor — no hace falta para el volumen de un household de 2 personas.

**Señal visual**: reutiliza `ProgressBar` (ya existe) con `ratio` del cálculo de arriba. Color del relleno: `--gain-color` por debajo de 80%, el `color` propio de la categoría (Fase 1) entre 80–100%, `--loss-color` a partir de 100% — los tres tokens ya existen, ninguno nuevo.

### Tipos TS
```ts
export interface Budget {
  id: string
  householdId: string
  categoryId: string
  periodMonth: string // 'YYYY-MM-01'
  amount: number
  createdAt: string
  updatedAt: string
}

export interface BudgetProgress extends Budget {
  spent: number
  ratio: number
}
```

### Componentes
Nuevos: `BudgetList.tsx` (una fila por categoría con `ProgressBar` + "$X de $Y"), `BudgetForm.tsx` (categoría vía `Select` filtrado a `expense` y excluyendo las que ya tienen presupuesto este mes — la categoría queda fija al editar, solo el monto es editable). Reutiliza `ProgressBar`, `ConfirmDialog`. Página en `/presupuesto` (antes un placeholder).

---

## Fase 7 — Gráfico del dashboard ✅ construida

**Resuelta la pregunta abierta**: se usó **Recharts**, la opción recomendada por el plan — SVG puro, sin Tailwind, y sus props de color (`fill`/`stroke`) aceptan directamente `"var(--token)"` igual que el resto de la app.

### Los 3 gráficos, tal como se construyeron

**a) Gastos por categoría (mes actual)** — dona (`PieChart`/`Pie`/`Cell`), un `Cell` por categoría con `fill`/`stroke` = `bg`/`text` del `color` de la categoría (mismos tokens de Fase 1), más una leyenda debajo con nombre y monto (reutiliza el mismo cálculo de `spentByCategory` que ya tenía `useBudgets`, esta vez sobre transacciones del mes en curso).

**b) Ingresos vs. gastos** — barras agrupadas de los últimos 6 meses (se optó por la variante "con contexto" que el plan dejaba como opción, en vez de solo 2 barras del período actual) — `--gain-color` para ingresos, `--loss-color` para gastos, meses sin movimientos igual aparecen en cero (se siembran los 6 meses de antemano, no solo los que tienen datos).

**c) Evolución del patrimonio** — área (`AreaChart`) de los últimos 90 días. Igual que documentaba el plan: la curva de Cuentas es exacta (reconstruida día a día desde las transacciones), Deudas e Inversiones se suman con su valor **actual** de forma constante en todo el rango — no tienen historial propio. La reconstrucción evita traer todo el historial: se calcula el saldo de cuentas al *inicio* de la ventana como `saldo_actual − suma(transacciones dentro de la ventana)`, y desde ahí se acumula día a día hacia adelante — invariante verificable: el último punto de la curva siempre coincide exactamente con el saldo actual de cuentas.

**Consulta a Supabase**: una sola, acotada a los últimos 6 meses (`listTransactions({ from: <inicio de hace 5 meses> })`) — alimenta los 3 gráficos a la vez, la ventana de 90 días de (c) es un subconjunto de la de 6 meses de (b). Nada de funciones nuevas en la base de datos.

### Componentes
Nuevos: `CategoryBreakdownChart.tsx`, `IncomeVsExpenseChart.tsx`, `NetWorthTrendChart.tsx` (cada uno envuelto en `Card`, mismo marco visual que "Últimos movimientos"), `useDashboardCharts.ts` (la única consulta + las 3 derivaciones), `tooltipFormat.ts` (helpers de formato para los tooltips de Recharts — ver nota abajo).

**Detalle de Recharts 3.x**: los props `formatter`/`labelFormatter` de `Tooltip` tipan el valor como `ValueType | undefined` en vez de `number` — pasar `(value: number) => formatCurrency(value)` directo no compila. Se resolvió con dos helpers compartidos (`formatTooltipCurrency`/`formatTooltipDate`) que aceptan `unknown` y normalizan, en vez de repetir el cast en cada gráfico.

**Verificación con falsa alarma**: al probar visualmente, la dona salió como una astilla diminuta en la esquina — parecía un bug real de tamaño/ángulo. Antes de tocar código, se depuró con los `path d` del SVG: los 3 gráficos medían el mismo ancho (362px, correcto), pero los ángulos de cada porción sumaban ~24° en vez de 360°. La causa: Recharts anima la entrada del `Pie` (400ms de espera + 1500ms de animación por defecto en v3) y la captura de pantalla se tomó a los 400ms — justo cuando la animación recién arranca desde 0°. Con una espera de ~2.5s la dona se ve perfecta. No fue necesario cambiar nada del componente.

---

## Fase 0.5 — Onboarding de household 🟨 rediseñado

`handle_new_user()` crea el `profile` al registrarse pero nunca asignaba `household_id` — no había ningún paso que creara un household ni que permitiera a la pareja unirse al mismo. Como **todas** las tablas de los 7 módulos dependen de `household_id`, esto bloqueaba absolutamente todo (se descubrió al intentar probar Categorías en vivo). Se construyó antes de seguir con Cuentas, en vez de parchear con SQL a mano.

**Rediseñado el 2026-09-26** con el sistema visual de onboarding (ver DESIGN.md § Identidad de marca). La primera versión era una sola pantalla con toggle "Crear / Unirme con un código"; lo que sigue describe el flujo actual.

**Cómo entra el usuario:**
- `RequireHousehold` (`components/auth/RequireHousehold.tsx`) se monta dentro de `RequireAuth`, antes del `AppShell`. Si el `profile` no tiene `household_id`, primero intenta consumir una invitación pendiente (ver "Invitación por link o QR"); si no hay, muestra `HouseholdSetup` en vez de la app.

**`HouseholdSetup` (`pages/HouseholdSetup.tsx`), por pasos:**
1. **Elegir y nombrar**: "Cuenta individual" o "Cuentas en pareja" (`RadioCardGroup`) más el nombre del hogar. Al tocar "Crear" se inserta el household y se vincula el perfil.
2. **Invitar** (solo pareja): código del hogar (`InviteCodeBadge`), botón "Compartir" (Web Share API, o copiar al portapapeles si no hay) y "Ver QR" (`InviteQrCode`). El código y el QR solo aparecen **después** de crear el household: antes, alguien podía escanearlo y unirse a un hogar que todavía no existía.
3. **Preferencias**: moneda principal para ambos modos; en pareja, además, cómo repartir los gastos compartidos (`RadioListGroup`: proporcional, indiferente o 50/50). Se guardan en `households.currency` y `households.expense_split` (migración `20260926190000_household_preferences.sql`).
- Aparte, "¿Tienes un código? Únete aquí" lleva a un formulario para pegar el código a mano, para quien no puede escanear el QR. Unirse a un hogar existente no pide preferencias: ya las definió quien lo creó.
- Layout y piezas: `OnboardingLayout` (encabezado con degradado de marca), `SegmentedProgress` (2 pasos en individual, 3 en pareja) y `AvatarPair`.

**Invitación por link o QR:**
- El QR y "Compartir" apuntan a `/unirse/<householdId>`, un link real que abre cualquier cámara.
- `JoinRedirect` (`pages/JoinRedirect.tsx`) guarda el id como invitación pendiente (`lib/pendingInvite.ts`, en `localStorage`) y redirige: con sesión, a `/dashboard`; sin sesión, a `/registro`.
- Al registrarse con una invitación pendiente, `Login.tsx` manda `emailRedirectTo: /unirse/<id>` a Supabase. Así el link del correo de confirmación trae el id de vuelta en la URL, aunque se abra en otro navegador donde no existe ese `localStorage`.
- `RequireHousehold` hace la unión y limpia la invitación pendiente, tanto si sale bien como si falla (así no queda reintentando). Si el código ya no es válido, muestra el error y cae al flujo normal.
- Si el usuario **ya pertenece** a un hogar, la invitación se ignora: nunca se lo cambia de hogar automáticamente.

**El código de invitación tiene 8 caracteres** (desde el 2026-09-28, migración `20260928204816_household_invite_code.sql`). Antes era el UUID del household, de 36 caracteres, imposible de dictar o escribir a mano.
- La base lo genera al crear el hogar (`households.invite_code`), a partir de un alfabeto de 32 sin los que se confunden (0/O, 1/I): 32^8 ≈ 1,1 billones de combinaciones.
- Unirse pasa por la función `join_household(p_code)`, `security definer` porque quien se une todavía no puede ver el hogar. Solo la pueden ejecutar usuarios con sesión; solo cambia el perfil de quien llama y solo si no tiene hogar; rechaza un hogar que ya tiene dos personas. Cada error trae su código: P0002 no existe, TW002 ya tiene hogar, TW003 hogar lleno.
- El link del QR y de "Compartir" es `/unirse/<código>`. Los links viejos con el UUID dejan de funcionar.

**`InviteHousehold`** (`pages/InviteHousehold.tsx`, ruta `/invitar`, desde "Ver más"): para ver, copiar o mostrar como QR el código después de crear el hogar, y ver quién ya se unió.

**Decisiones de implementación que no hay que deshacer:**
- **El `id` del household se genera en el cliente** (`crypto.randomUUID()`) y el insert no lleva `.select()`: la policy `households_select_member` solo deja leer un household del que ya eres miembro, y justo al crearlo tu perfil todavía no está vinculado, así que leerlo de vuelta falla.
- **Los `update` sí llevan `.select().single()`**: sin eso, si RLS filtra la fila (0 filas afectadas), Supabase no devuelve error y el cambio "funciona" sin guardar nada. Así se perdía la vinculación del perfil y la pantalla quedaba en "Creando…".

**Verificación en vivo:**
- ✅ Crear cuenta individual, de punta a punta (2026-09-26).
- ⬜ Crear en pareja, compartir el QR y que la segunda persona se registre desde el link y quede unida.
- Al probar, usar siempre un correo nunca usado antes y una sesión limpia. Reusar un correo, o borrar un usuario en Supabase sin cerrar su sesión, produce fallos que parecen bugs y no lo son.

## Fase 0.6 — Autenticación social (Google / Apple) 🟨 construida

Botones "Continuar con Google" / "Continuar con Apple" en `Login.tsx`, debajo del formulario de correo — mismo flujo para iniciar sesión y para registrarse (`signInWithOAuth` crea la cuenta sola la primera vez, no hace falta un modo "signup" separado como en el de correo/contraseña).

**Qué se construyó:**
- `SocialAuthButtons.tsx` (`components/auth/`): dos botones que llaman a `supabase.auth.signInWithOAuth({ provider: 'google' | 'apple', options: { redirectTo: '<origin>/dashboard' } })`. Íconos de marca inline (SVG), sin librería nueva.
- `Login.tsx`: al volver del proveedor, si algo falla (usuario cancela, proveedor no configurado, etc.) Supabase redirige con `#error_description=...` en el hash — se parsea en un `useEffect` y se muestra con el mismo `translateAuthError` que ya usan los errores de correo/contraseña.
- **`handle_new_user()` actualizado** (`20260926140845_social_auth_display_name.sql`): el trigger que crea el `profile` al registrarse solo sabía leer `display_name` (la clave que manda el formulario de correo). Google manda `full_name`/`name` y Apple manda `name` (solo la primera vez que autoriza) — sin este cambio, todo usuario social caía al fallback `split_part(email, '@', 1)` en vez de mostrar su nombre real. También se agregó `picture` como alternativa a `avatar_url` para la foto de perfil.

**Falta antes de poder probarlo en vivo (fuera del código, en los dashboards de Google/Apple/Supabase):**
1. **Google Cloud Console** → crear credencial OAuth tipo "Web application" → Authorized redirect URI: `https://<tu-project-ref>.supabase.co/auth/v1/callback` (la URL exacta está en Supabase Dashboard → Authentication → Providers → Google) → copiar Client ID y Client Secret.
2. **Apple Developer** → un App ID (con "Sign in with Apple" habilitado) + un Services ID (este es el Client ID) + una Key (`.p8`) para generar el secreto → mismo redirect URI que arriba, registrado como Website URL del Services ID. El secreto de Apple **expira cada 6 meses** y hay que regenerarlo a mano — no hay forma de automatizarlo desde el código.
3. **Supabase Dashboard** → Authentication → Providers → activar Google y Apple, pegar las credenciales de los pasos 1 y 2.

Sin este paso de configuración externa, los botones redirigen a una pantalla de error de Supabase ("provider not enabled") — es esperado, no un bug de la app.

## Pendientes (diferido a propósito, no es v1)

Decisiones ya tomadas: se construye simple ahora, se deja documentado dónde enganchar la mejora después sin migrar ni romper nada de lo ya hecho.

- **Prorrateo de gastos compartidos**: `ownerId`/`memberId` es binario — "de una persona" o "compartida" (100/0, no hay 60/40). Muchas parejas dividen por proporción según ingreso en vez de mitad y mitad, pero v1 solo necesita ver quién gastó qué. Cuando se quiera, es agregar una columna `split_ratio` a `transactions` — no toca el modelo actual.
- **Contador manual de cuotas** (`installments_remaining` en Deudas, Fase 3): guardarlo como contador que se decrementa a mano se desincroniza fácil (un mes sin pagar, un abono extra). La alternativa más robusta es derivarlo de fecha de inicio + `installment_amount` en vez de contar. Para v1 se implementa como columna editable simple, tal como está en la Fase 3 más abajo; se revisita si en el uso real se nota que se desalinea.

## Estado del plan

Las 7 fases del plan original (más la 0 y la 0.5 que se agregaron al construir) están implementadas — ver la tabla de arriba para el detalle de qué falta verificar en vivo en cada una. Lo único que queda deliberadamente afuera de v1 está en "Pendientes" arriba.

## BORRAR TABLAS
truncate table
  public.transactions,
  public.budgets,
  public.debts,
  public.investments,
  public.accounts,
  public.categories,
  public.profiles,
  public.households
cascade;

## DESPLEGAR Y SUBIR AL GITHUB
git add -A
git status   # revisa que solo aparezca lo que quieres subir
git commit -m "Aplicación de mejora Fase 13"
git push origin main
