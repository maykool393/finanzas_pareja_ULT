-- ============================================================================
-- R6 del rediseño (README § Plan de rediseño Twoney): cuenta principal y
-- grupos de inversiones.
-- ============================================================================

-- ---------- Cuenta principal ----------
-- La marca la estrella en la tarjeta de Patrimonio (DESIGN.md § Tarjeta de
-- cuenta y de deuda). Una sola por hogar.
alter table public.accounts
  add column is_primary boolean not null default false;

-- Índice único parcial: solo cuenta las marcadas, así puede haber muchas
-- desmarcadas y a lo sumo una principal por hogar.
create unique index accounts_one_primary_per_household
  on public.accounts (household_id)
  where is_primary;

comment on column public.accounts.is_primary is
  'Cuenta principal del hogar (a lo sumo una, ver set_primary_account).';

-- Marcar una cuenta desmarca la anterior en la misma transacción: con dos
-- pedidos desde la app, el índice de arriba rechazaría el segundo si llegara
-- primero, y un corte entre medio dejaría dos intentos a medias.
-- security invoker: corre con los permisos de quien llama, así que la policy
-- accounts_all_household sigue limitando todo a su hogar.
create or replace function public.set_primary_account(p_account_id uuid)
returns void
language plpgsql
volatile
security invoker
set search_path = ''
as $$
begin
  update public.accounts
     set is_primary = false
   where household_id = public.current_household_id()
     and is_primary
     and id <> p_account_id;

  update public.accounts
     set is_primary = true
   where id = p_account_id
     and household_id = public.current_household_id();

  if not found then
    raise exception 'La cuenta no existe.' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.set_primary_account(uuid) from public, anon;
grant execute on function public.set_primary_account(uuid) to authenticated;

-- ---------- Grupos de inversiones ----------
-- Agrupan inversiones en la lista de Patrimonio (DESIGN.md § Lista de
-- inversiones): un encabezado con su cuadro de ícono y un botón +. La
-- variante de color es del grupo; investments.color_variant deja de usarse.
create table public.investment_groups (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  icon text not null default 'trend-up',
  color_variant text not null default 'a' check (color_variant in ('a', 'b')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Sin dos grupos con el mismo nombre en un hogar. También es el índice de
  -- las búsquedas por hogar (household_id va primero).
  unique (household_id, name),
  -- Destino de la clave compuesta de investments (abajo).
  unique (id, household_id)
);

comment on table public.investment_groups is 'Grupos de inversiones de un hogar (ej. "De giro").';

alter table public.investment_groups enable row level security;

create trigger set_investment_groups_updated_at
  before update on public.investment_groups
  for each row execute function public.set_updated_at();

create policy "investment_groups_all_household"
on public.investment_groups for all
to authenticated
using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());

-- Explícito por si la Data API no expone sola las tablas nuevas. La policy
-- de arriba limita las filas a las del propio hogar.
grant select, insert, update, delete on public.investment_groups to authenticated;

-- La inversión apunta a su grupo y a su hogar a la vez: la clave compuesta
-- impide enlazarla a un grupo de otro hogar, aunque alguien conociera su id.
-- Al borrar el grupo, solo group_id vuelve a null: la inversión pasa a "Otras".
alter table public.investments
  add column group_id uuid,
  add constraint investments_group_fkey
    foreign key (group_id, household_id)
    references public.investment_groups (id, household_id)
    on delete set null (group_id);

create index investments_group_id_idx on public.investments (group_id);

comment on column public.investments.group_id is 'Grupo de la inversión; null = sin grupo ("Otras").';
