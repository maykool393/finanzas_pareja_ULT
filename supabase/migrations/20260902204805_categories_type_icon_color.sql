-- Fase 1 — Categorías de gastos e ingresos (ver README.md)

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
