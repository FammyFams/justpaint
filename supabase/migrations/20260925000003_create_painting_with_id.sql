-- Revise create_painting() to accept a client-generated id, so the caller can
-- upload the image to storage (path keyed by painting id) before the DB row
-- exists, then pass the same id through -- avoiding a second update() call
-- that guest uploads couldn't make anyway (guests only get RPC-level insert).

drop function if exists public.create_painting(text, text, text, text, text[], text);

create or replace function public.create_painting(
  p_id uuid,
  p_title text,
  p_description text,
  p_image_path text,
  p_aspect text,
  p_tag_names text[] default '{}',
  p_guest_name text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid := auth.uid();
  v_tag_name text;
  v_tag_slug text;
  v_tag_id uuid;
begin
  if v_owner is null and (p_guest_name is null or length(trim(p_guest_name)) = 0) then
    raise exception 'guest_name is required when posting without an account';
  end if;

  if p_title is null or length(trim(p_title)) = 0 then
    raise exception 'title is required';
  end if;

  if p_aspect not in ('portrait', 'landscape', 'square') then
    raise exception 'invalid aspect: %', p_aspect;
  end if;

  insert into public.paintings (id, owner_id, guest_name, title, description, image_path, aspect)
  values (
    p_id,
    v_owner,
    case when v_owner is null then trim(p_guest_name) else null end,
    trim(p_title),
    coalesce(p_description, ''),
    p_image_path,
    p_aspect
  );

  foreach v_tag_name in array coalesce(p_tag_names, '{}')
  loop
    v_tag_name := trim(v_tag_name);
    continue when length(v_tag_name) = 0;

    v_tag_slug := trim(both '-' from lower(regexp_replace(v_tag_name, '[^a-zA-Z0-9]+', '-', 'g')));
    continue when length(v_tag_slug) = 0;

    insert into public.tags (name, slug)
    values (v_tag_name, v_tag_slug)
    on conflict (slug) do update set slug = excluded.slug
    returning id into v_tag_id;

    insert into public.paintings_tags (painting_id, tag_id)
    values (p_id, v_tag_id)
    on conflict do nothing;
  end loop;

  return p_id;
end;
$$;

grant execute on function public.create_painting(uuid, text, text, text, text, text[], text) to anon, authenticated;
