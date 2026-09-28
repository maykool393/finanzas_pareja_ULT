-- ============================================================================
-- Código de invitación corto (8 caracteres) para unirse a un hogar.
--
-- Antes el código era el UUID del household (36 caracteres): imposible de
-- dictar o escribir a mano. Ahora cada hogar tiene su invite_code de 8
-- caracteres, de un alfabeto sin los que se confunden (0/O, 1/I), y unirse
-- pasa por join_household(), que busca el hogar por ese código.
--
-- La app lo muestra como XXXX-XXXX; al unirse acepta minúsculas, espacios y
-- guiones (join_household los normaliza).
-- ============================================================================

-- ---------- Generador ----------
-- 32^8 ≈ 1,1 billones de combinaciones. La aleatoriedad sale de
-- gen_random_uuid(), la fuente criptográfica de Postgres, sin depender del
-- esquema donde esté instalado pgcrypto. Se usan solo los bytes enteramente
-- aleatorios de un UUID v4 (el 6 y el 8 llevan bits fijos de versión y
-- variante); 256 es múltiplo de 32, así que el módulo no sesga. Un choque lo
-- rechaza el unique de abajo: con ese espacio, en la práctica no ocurre.
create or replace function public.generate_invite_code()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  random_bytes bytea := uuid_send(gen_random_uuid());
  byte_index int;
  code text := '';
begin
  foreach byte_index in array array[0, 1, 2, 3, 4, 5, 9, 10] loop
    code := code || substr(alphabet, (get_byte(random_bytes, byte_index) % 32) + 1, 1);
  end loop;
  return code;
end;
$$;

-- Lo ejecuta el default de la columna al crear un hogar desde la app.
revoke execute on function public.generate_invite_code() from public, anon;
grant execute on function public.generate_invite_code() to authenticated;

-- ---------- Columna ----------
-- El default volátil se evalúa fila por fila al agregar la columna: los
-- hogares que ya existen reciben cada uno su código en la misma sentencia.
alter table public.households
  add column invite_code text not null default public.generate_invite_code();

-- El unique crea el índice que usa la búsqueda de join_household.
alter table public.households
  add constraint households_invite_code_key unique (invite_code),
  add constraint households_invite_code_format
    check (invite_code ~ '^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$');

comment on column public.households.invite_code is
  'Código de 8 caracteres para que la pareja se una al hogar (ver join_household).';

-- ---------- Unirse ----------
-- security definer: quien se une todavía no es miembro, y la policy
-- households_select_member no le deja ver el hogar para buscarlo por código.
-- Por eso la función corre como su dueño, con estos límites:
--   - solo la ejecuta un usuario autenticado (se revoca a public y anon);
--   - solo cambia el perfil de quien llama (auth.uid()), y solo si todavía no
--     tiene hogar: nunca lo saca del suyo;
--   - no deja entrar a un hogar que ya tiene dos personas;
--   - devuelve solo el id del hogar al que se unió.
-- Cada error trae su SQLSTATE, para que la app muestre el mensaje correcto:
--   P0002 el código no existe · TW002 ya tiene hogar · TW003 hogar completo.
create or replace function public.join_household(p_code text)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  normalized text := upper(regexp_replace(coalesce(p_code, ''), '[^0-9A-Za-z]', '', 'g'));
  target uuid;
begin
  if caller is null then
    raise exception 'Se necesita una sesión para unirse a un hogar.' using errcode = '42501';
  end if;

  if exists (select 1 from public.profiles as p where p.id = caller and p.household_id is not null) then
    raise exception 'Ya perteneces a un hogar.' using errcode = 'TW002';
  end if;

  select h.id into target from public.households as h where h.invite_code = normalized;
  if target is null then
    raise exception 'El código de invitación no existe.' using errcode = 'P0002';
  end if;

  if (select count(*) from public.profiles as p where p.household_id = target) >= 2 then
    raise exception 'Ese hogar ya tiene dos personas.' using errcode = 'TW003';
  end if;

  -- "household_id is null" otra vez: si otra pestaña lo unió entre medio, no se pisa.
  update public.profiles
     set household_id = target
   where id = caller
     and household_id is null;

  if not found then
    raise exception 'Ya perteneces a un hogar.' using errcode = 'TW002';
  end if;

  return target;
end;
$$;

revoke execute on function public.join_household(text) from public, anon;
grant execute on function public.join_household(text) to authenticated;
