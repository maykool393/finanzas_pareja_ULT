-- ============================================================================
-- Preferencias del household, capturadas en el último paso del onboarding
-- (HouseholdSetup): moneda principal y, para "cuentas en pareja", cómo
-- reparten los gastos compartidos. "Cuenta individual" solo pide moneda —
-- expense_split no aplica cuando hay un solo miembro, se deja en el default.
-- ============================================================================

alter table public.households
  add column currency text not null default 'CLP',
  add column expense_split text not null default 'indiferente'
    check (expense_split in ('proporcional', 'indiferente', '50-50'));

comment on column public.households.currency is 'Moneda principal del household (ISO 4217), elegida en el onboarding.';
comment on column public.households.expense_split is 'Cómo se reparten los gastos compartidos entre los miembros — sin efecto en cuentas individuales.';
