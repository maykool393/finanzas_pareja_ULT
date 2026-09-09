-- Fase 6 — Presupuestos (ver README.md)

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
