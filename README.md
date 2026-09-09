# WeWallet

Finanzas compartidas en pareja. React + TypeScript + Vite + Supabase (Postgres + Auth), CSS con variables nativas (sin Tailwind). Ver [DESIGN.md](DESIGN.md) para el sistema de diseño y `supabase/migrations/` para el historial de esquema aplicado.

**Flujo de SQL**: cada cambio de esquema es un archivo nuevo en `supabase/migrations/` (`npx supabase migration new <descripción>`), nunca se edita uno ya aplicado. `20260902204206_baseline_schema.sql` es el punto de partida (todo lo aplicado antes de adoptar este flujo); de ahí en adelante, una migración por cambio, en el orden en que se van corriendo a mano en el SQL Editor de Supabase.

## Estado actual

Ya construido y en producción de desarrollo:

- **Autenticación**: login, registro, recuperar/restablecer contraseña (`src/pages/Login.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`), sesión vía `useSession`, rutas protegidas vía `RequireAuth`.
- **Onboarding**: `Welcome.tsx` en `/`, solo la primera vez (`hasSeenOnboarding` en `localStorage`).
- **Sistema de diseño**: tokens claro/oscuro (`src/styles/tokens.css`), `RippleBackground`, `AppShell` con nav de 5 secciones, `Card`, `ItemCard`, `SectionHeader`, `ProgressBar`.
- **Esquema base en Supabase**: `households`, `profiles`, `categories`, `accounts`, `debts`, `investments`, `transactions` (columnas mínimas — este plan las extiende), con RLS por household en todas.
- **Dashboard** (`src/pages/Dashboard.tsx`): usa datos `MOCK`, pendiente de conectar a Supabase — es el primer punto de integración real de cada módulo.

Este documento es el plan de los 7 módulos que faltan. Se actualiza el **Estado** de cada fase a medida que se completa — no se implementa nada de lo descrito aquí hasta acordarlo fase por fase.

## Fases y estado

| Fase | Módulo | Depende de | Estado |
|---|---|---|---|
| 0 | Fundamentos compartidos (UI + convenciones) | — | ✅ Completo |
| 0.5 | Onboarding de household (crear + unirse por invitación) | Fase 0 | ✅ Completo — verificado en vivo |
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

## Fase 0.5 — Onboarding de household ✅

`handle_new_user()` crea el `profile` al registrarse pero nunca asignaba `household_id` — no había ningún paso que creara un household ni que permitiera a la pareja unirse al mismo. Como **todas** las tablas de los 7 módulos dependen de `household_id`, esto bloqueaba absolutamente todo (se descubrió al intentar probar Categorías en vivo). Se construyó antes de seguir con Cuentas, en vez de parchear con SQL a mano.

**Qué se construyó:**
- `RequireHousehold` (`components/auth/RequireHousehold.tsx`): se monta dentro de `RequireAuth`, antes del `AppShell`. Si el `profile` no tiene `household_id`, muestra `HouseholdSetup` en vez de la app.
- `HouseholdSetup` (`pages/HouseholdSetup.tsx`): mismo tratamiento visual que login/registro (`AuthLayout` + `RippleBackground`), con toggle "Crear" / "Unirme con un código".
- **El código de invitación es el UUID del household** — no hace falta columna ni tabla nueva. Es imposible de adivinar (128 bits al azar) y unirse es solo `update profiles set household_id = <código> where id = auth.uid()`, ya cubierto por la policy `profiles_update_self` que ya existía.
- `InviteHousehold` (`pages/InviteHousehold.tsx`, ruta `/invitar`, enlazada desde "Ver más"): para ver/copiar el código después de haberlo creado, y ver quién ya se unió.
- **Bug de RLS encontrado y corregido antes de probar**: crear un household con `.insert().select()` fallaba en silencio — la policy `households_select_member` solo deja leer un household del que ya eres miembro, y justo al crearlo tu perfil todavía no está vinculado, así que el `select()` encadenado no devolvía nada. Se resolvió generando el `id` en el cliente (`crypto.randomUUID()`) en vez de leerlo de vuelta.

**Sin probar en vivo todavía**: el proyecto de Supabase exige confirmación de correo, así que no pude automatizar un registro completo de punta a punta (no tengo acceso a una bandeja de entrada real). Intenté con una cuenta desechable (`wewallet-e2e-test+...@mailinator.com`, sin confirmar, inofensiva) para verificar hasta donde se pudo — el resto (compilación, lint, la lógica de RLS trazada a mano) está verificado, pero falta que confirmes tú con tu cuenta real: entra a la app y deberías caer directo en la pantalla "Crear/Unirme" en vez del dashboard.

## Pendientes (diferido a propósito, no es v1)

Decisiones ya tomadas: se construye simple ahora, se deja documentado dónde enganchar la mejora después sin migrar ni romper nada de lo ya hecho.

- **Prorrateo de gastos compartidos**: `ownerId`/`memberId` es binario — "de una persona" o "compartida" (100/0, no hay 60/40). Muchas parejas dividen por proporción según ingreso en vez de mitad y mitad, pero v1 solo necesita ver quién gastó qué. Cuando se quiera, es agregar una columna `split_ratio` a `transactions` — no toca el modelo actual.
- **Contador manual de cuotas** (`installments_remaining` en Deudas, Fase 3): guardarlo como contador que se decrementa a mano se desincroniza fácil (un mes sin pagar, un abono extra). La alternativa más robusta es derivarlo de fecha de inicio + `installment_amount` en vez de contar. Para v1 se implementa como columna editable simple, tal como está en la Fase 3 más abajo; se revisita si en el uso real se nota que se desalinea.

## Estado del plan

Las 7 fases del plan original (más la 0 y la 0.5 que se agregaron al construir) están implementadas — ver la tabla de arriba para el detalle de qué falta verificar en vivo en cada una. Lo único que queda deliberadamente afuera de v1 está en "Pendientes" arriba.
