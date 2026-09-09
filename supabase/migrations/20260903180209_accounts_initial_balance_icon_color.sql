-- Fase 2 — Cuentas (ver README.md)

alter table public.accounts
  add column initial_balance numeric(14, 2) not null default 0,
  add column icon text not null default 'bank',
  add column color_variant text not null default 'a' check (color_variant in ('a', 'b')),
  add column archived_at timestamptz,
  add column updated_at timestamptz not null default now();

-- Por si ya hay cuentas creadas antes de este cambio: que su saldo inicial
-- arranque igual al saldo actual, no en 0.
update public.accounts set initial_balance = balance;

create trigger set_accounts_updated_at
  before update on public.accounts
  for each row execute function public.set_updated_at();

create index accounts_household_active_idx on public.accounts (household_id) where archived_at is null;
