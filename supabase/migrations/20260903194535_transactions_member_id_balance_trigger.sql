-- Fase 5 — Registro de transacciones (ver README.md)

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

-- ----------------------------------------------------------------------------
-- Integridad del saldo: accounts.balance se mantiene solo, nunca a mano.
-- security invoker (por defecto, explícito por claridad): corre como el
-- usuario autenticado; el UPDATE sobre accounts pasa por accounts_all_household
-- igual que cualquier otra escritura — no hace falta bypass de RLS porque solo
-- toca cuentas del mismo household que la transacción.
-- ----------------------------------------------------------------------------
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
      -- Si no, dos ediciones concurrentes que mueven plata entre las mismas
      -- dos cuentas en sentido contrario pueden bloquearse en círculo
      -- (deadlock) al tomar los locks en orden inverso una de la otra.
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
