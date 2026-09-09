-- Fase 3 — Deudas (ver README.md)

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

create index debts_household_active_idx on public.debts (household_id) where archived_at is null;
