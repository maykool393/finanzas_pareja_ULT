-- Fase 4 — Inversiones (ver README.md)
--
-- color_variant sí rota a/b como cuentas y deudas (--investment-b reutiliza
-- el verde de --account-a en tokens.css, no es un color nuevo).

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
