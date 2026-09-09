-- Corrige "stack depth limit exceeded" al crear/leer un household.
--
-- current_household_id() corría con security invoker y su propio SELECT sobre
-- profiles disparaba de nuevo la policy profiles_select_self_or_household —
-- que en su rama "or household_id = current_household_id()" vuelve a llamar
-- a esta misma función. Postgres expande eso en tiempo de planificación
-- (el corto-circuito del OR no aplica ahí) y se queda sin pila.
--
-- security definer rompe el ciclo: el SELECT interno corre como dueño de la
-- función (bypassa RLS), igual que ya hace handle_new_user() al insertar en
-- profiles. Sigue siendo seguro: solo devuelve el household_id del propio
-- auth.uid() del que llama, nunca de otra fila ni con input arbitrario.
create or replace function public.current_household_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select household_id from public.profiles where id = (select auth.uid())
$$;
