-- ============================================================================
-- Baseline — esquema aplicado antes de adoptar el flujo de migraciones.
--
-- Contenido histórico de supabase/schema.sql (households, profiles, categories,
-- accounts, debts, investments, transactions, RLS, y el trigger set_updated_at
-- de la Fase 0). Ya está aplicado en el proyecto de Supabase — este archivo
-- documenta el punto de partida, no hace falta volver a ejecutarlo.
--
-- De aquí en adelante, cada cambio de esquema (por fase, ver README.md) es una
-- migración nueva: `npx supabase migration new <descripcion>`.
-- ============================================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- households — la pareja/unidad familiar que comparte finanzas
-- ----------------------------------------------------------------------------
create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

comment on table public.households is 'Unidad (pareja/familia) que comparte cuentas, deudas e inversiones.';

alter table public.households enable row level security;

-- ----------------------------------------------------------------------------
-- profiles — un registro por auth.users, con el household al que pertenece
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  household_id uuid references public.households (id) on delete set null,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Datos públicos de cada usuario autenticado.';

create index profiles_household_id_idx on public.profiles (household_id);

alter table public.profiles enable row level security;

-- Crea el profile automáticamente al registrarse un usuario.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- categories — categorías de transacción propias de cada household
-- (referenciadas por transactions.category_id; no tenían tabla propia aún)
-- ----------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (household_id, name)
);

create index categories_household_id_idx on public.categories (household_id);

alter table public.categories enable row level security;

-- ----------------------------------------------------------------------------
-- accounts
-- ----------------------------------------------------------------------------
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  owner_id uuid references public.profiles (id) on delete set null, -- null = cuenta compartida
  name text not null,
  type text not null check (type in ('checking', 'savings', 'cash', 'credit_card')),
  balance numeric(14, 2) not null default 0,
  currency text not null default 'EUR',
  created_at timestamptz not null default now()
);

create index accounts_household_id_idx on public.accounts (household_id);
create index accounts_owner_id_idx on public.accounts (owner_id);

alter table public.accounts enable row level security;

-- ----------------------------------------------------------------------------
-- debts
-- ----------------------------------------------------------------------------
create table public.debts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  owner_id uuid references public.profiles (id) on delete set null,
  name text not null,
  principal numeric(14, 2) not null,
  remaining numeric(14, 2) not null,
  interest_rate numeric(6, 4),
  due_date date,
  created_at timestamptz not null default now()
);

create index debts_household_id_idx on public.debts (household_id);
create index debts_owner_id_idx on public.debts (owner_id);

alter table public.debts enable row level security;

-- ----------------------------------------------------------------------------
-- investments
-- ----------------------------------------------------------------------------
create table public.investments (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  owner_id uuid references public.profiles (id) on delete set null,
  name text not null,
  invested numeric(14, 2) not null,
  current_value numeric(14, 2) not null,
  created_at timestamptz not null default now()
);

create index investments_household_id_idx on public.investments (household_id);
create index investments_owner_id_idx on public.investments (owner_id);

alter table public.investments enable row level security;

-- ----------------------------------------------------------------------------
-- transactions
-- ----------------------------------------------------------------------------
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete restrict,
  amount numeric(14, 2) not null, -- negativo = gasto, positivo = ingreso
  description text not null,
  category_id uuid references public.categories (id) on delete set null,
  occurred_at timestamptz not null default now()
);

create index transactions_household_id_idx on public.transactions (household_id);
create index transactions_account_id_idx on public.transactions (account_id);
create index transactions_category_id_idx on public.transactions (category_id);
create index transactions_occurred_at_idx on public.transactions (occurred_at desc);

alter table public.transactions enable row level security;

-- ============================================================================
-- Fase 0 — fundamentos compartidos (ver README.md)
-- ============================================================================

-- Trigger compartido: mantiene updated_at al día en cada tabla que lo declare.
-- Se reutiliza en cada módulo (Fase 1 en adelante) con:
--   create trigger set_<tabla>_updated_at
--     before update on public.<tabla>
--     for each row execute function public.set_updated_at();
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

-- ============================================================================
-- Row Level Security
-- ============================================================================

-- Household del usuario autenticado actual (o null si aún no tiene uno).
-- security invoker: se ejecuta con los permisos del que llama, respetando la
-- policy de profiles de más abajo — no hace falta security definer aquí.
create or replace function public.current_household_id()
returns uuid
language sql
stable
security invoker
set search_path = ''
as $$
  select household_id from public.profiles where id = (select auth.uid())
$$;

-- ---------- profiles ----------
create policy "profiles_select_self_or_household"
on public.profiles for select
to authenticated
using (
  id = (select auth.uid())
  or household_id = public.current_household_id()
);

create policy "profiles_update_self"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- ---------- households ----------
create policy "households_select_member"
on public.households for select
to authenticated
using (id = public.current_household_id());

-- Cualquier usuario autenticado puede crear un household (p. ej. al hacer
-- onboarding); luego se enlaza a él actualizando su propio profile.
create policy "households_insert_authenticated"
on public.households for insert
to authenticated
with check (true);

create policy "households_update_member"
on public.households for update
to authenticated
using (id = public.current_household_id())
with check (id = public.current_household_id());

-- ---------- categories / accounts / debts / investments / transactions ----------
-- Mismo patrón en las cinco: solo los miembros del household ven y modifican
-- sus propias filas.
create policy "categories_all_household"
on public.categories for all
to authenticated
using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());

create policy "accounts_all_household"
on public.accounts for all
to authenticated
using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());

create policy "debts_all_household"
on public.debts for all
to authenticated
using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());

create policy "investments_all_household"
on public.investments for all
to authenticated
using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());

create policy "transactions_all_household"
on public.transactions for all
to authenticated
using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());
