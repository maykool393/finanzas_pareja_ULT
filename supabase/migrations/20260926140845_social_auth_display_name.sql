  -- ============================================================================
  -- Autenticación social (Google / Apple) — handle_new_user() solo sabía leer
  -- `display_name` (el campo que manda el formulario de registro por correo).
  -- Google y Apple no mandan esa clave: mandan `full_name`/`name` (Google) o
  -- `name` (Apple, solo en el primer login) en raw_user_meta_data, y el avatar
  -- viene como `avatar_url` o `picture` según el proveedor. Sin este cambio,
  -- todo usuario que entre con Google/Apple caía al fallback
  -- (split_part(email, '@', 1)) en vez de mostrar su nombre real.
  -- ============================================================================

  create or replace function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
  as $$
  begin
    insert into public.profiles (id, display_name, avatar_url)
    values (
      new.id,
      coalesce(
        new.raw_user_meta_data ->> 'display_name',
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'name',
        split_part(new.email, '@', 1)
      ),
      coalesce(
        new.raw_user_meta_data ->> 'avatar_url',
        new.raw_user_meta_data ->> 'picture'
      )
    );
    return new;
  end;
  $$;
