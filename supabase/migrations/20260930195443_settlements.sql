-- ============================================================================
-- R7 del rediseño (README § Plan de rediseño Twoney): "Saldar" los gastos
-- compartidos del mes (DESIGN.md § Resumen, historia 2).
--
-- Saldar anota que quien pagó de menos le transfirió la diferencia a quien
-- pagó de más. La transferencia real se hace en el banco; aquí quedan:
--   - un saldo (settlements): de quién, a quién, cuánto y de qué mes;
--   - dos movimientos enlazados al saldo: la salida de la cuenta de quien
--     debía y la entrada en la de quien cobra. Mueven los saldos de las
--     cuentas (trigger de siempre), pero no son ingreso ni gasto: la app los
--     reconoce por settlement_id y los deja fuera del Resumen, del reparto y
--     de los presupuestos.
-- ============================================================================

create table public.settlements (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  period_month date not null check (extract(day from period_month) = 1), -- siempre día 1, ej. 2026-09-01
  -- null solo si esa persona borró su perfil: el saldo sigue contando para el mes.
  from_member_id uuid references public.profiles (id) on delete set null,
  to_member_id uuid references public.profiles (id) on delete set null,
  amount numeric(14, 2) not null check (amount > 0),
  created_at timestamptz not null default now(),
  check (from_member_id <> to_member_id),
  -- Destino de la clave compuesta de transactions (abajo).
  unique (id, household_id)
);

comment on table public.settlements is
  'Saldos de gastos compartidos: quien debía le transfirió a la otra persona (ver create_settlement).';

-- La historia pide los saldos de un mes del hogar.
create index settlements_household_month_idx on public.settlements (household_id, period_month);
create index settlements_from_member_id_idx on public.settlements (from_member_id);
create index settlements_to_member_id_idx on public.settlements (to_member_id);

alter table public.settlements enable row level security;

create policy "settlements_all_household"
on public.settlements for all
to authenticated
using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());

-- Sin update: un saldo no se edita. Se elimina (y con él sus dos movimientos)
-- y se vuelve a registrar.
grant select, insert, delete on public.settlements to authenticated;

-- Los dos movimientos apuntan a su saldo y a su hogar a la vez: la clave
-- compuesta impide enlazarlos al saldo de otro hogar. Al eliminar el saldo se
-- eliminan los dos, y el trigger de siempre devuelve los saldos de las cuentas.
alter table public.transactions
  add column settlement_id uuid,
  add constraint transactions_settlement_fkey
    foreign key (settlement_id, household_id)
    references public.settlements (id, household_id)
    on delete cascade,
  -- Una transferencia no tiene categoría: así tampoco entra en un presupuesto.
  add constraint transactions_settlement_no_category
    check (settlement_id is null or category_id is null);

-- Parcial: casi ningún movimiento es de un saldo. Lo usa el borrado en cascada.
create index transactions_settlement_id_idx
  on public.transactions (settlement_id)
  where settlement_id is not null;

comment on column public.transactions.settlement_id is
  'Saldo al que pertenece (transferencia entre la pareja); null = ingreso o gasto normal.';

-- Registra el saldo y sus dos movimientos en una sola transacción: si algo
-- falla, no queda un saldo sin movimientos ni un movimiento suelto.
-- security invoker: las policies de siempre limitan todo al propio hogar.
-- De quién y a quién salen de los dueños de las cuentas: la de origen es de
-- quien debía y la de destino, de quien cobra. Una cuenta compartida no sirve:
-- es de los dos.
create or replace function public.create_settlement(
  p_period_month date,
  p_from_account_id uuid,
  p_to_account_id uuid,
  p_amount numeric,
  p_occurred_at date
)
returns uuid
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  v_household_id uuid := public.current_household_id();
  v_user_id uuid := (select auth.uid());
  v_from_member_id uuid;
  v_to_member_id uuid;
  v_settlement_id uuid;
begin
  if v_household_id is null then
    raise exception 'No perteneces a un hogar.' using errcode = '42501';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'El monto tiene que ser mayor que cero.' using errcode = '22023';
  end if;

  select owner_id into v_from_member_id
    from public.accounts
   where id = p_from_account_id
     and household_id = v_household_id
     and archived_at is null;
  if not found then
    raise exception 'La cuenta de origen no existe.' using errcode = 'P0002';
  end if;

  select owner_id into v_to_member_id
    from public.accounts
   where id = p_to_account_id
     and household_id = v_household_id
     and archived_at is null;
  if not found then
    raise exception 'La cuenta de destino no existe.' using errcode = 'P0002';
  end if;

  if v_from_member_id is null or v_to_member_id is null or v_from_member_id = v_to_member_id then
    raise exception 'Cada cuenta tiene que ser de una persona distinta.' using errcode = '22023';
  end if;

  insert into public.settlements (household_id, period_month, from_member_id, to_member_id, amount)
  values (
    v_household_id,
    (p_period_month - (extract(day from p_period_month)::int - 1)),
    v_from_member_id,
    v_to_member_id,
    p_amount
  )
  returning id into v_settlement_id;

  insert into public.transactions
    (household_id, account_id, created_by, member_id, amount, description, occurred_at, settlement_id)
  values
    (v_household_id, p_from_account_id, v_user_id, v_from_member_id, -p_amount, null, p_occurred_at, v_settlement_id),
    (v_household_id, p_to_account_id, v_user_id, v_to_member_id, p_amount, null, p_occurred_at, v_settlement_id);

  return v_settlement_id;
end;
$$;

revoke execute on function public.create_settlement(date, uuid, uuid, numeric, date) from public, anon;
grant execute on function public.create_settlement(date, uuid, uuid, numeric, date) to authenticated;
