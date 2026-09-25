-- Security hardening from audit findings:
-- 1. Restrict the paintings bucket to raster image types only. SVG allowed
--    "image/*" validation client+server-side, but SVGs can embed <script>
--    and the bucket serves files as-is at a public URL -- stored-XSS risk
--    if someone opens the raw object URL directly.
-- 2. create_painting() accepted any p_image_path with no check that it was
--    actually uploaded by the caller -- anyone could reference another
--    artist's already-uploaded image path and create a new painting row
--    attributing that artwork to themselves. Now requires the path's
--    top-level folder to match the caller's own upload folder and that the
--    object actually exists.

update storage.buckets
set allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
where id = 'paintings';

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
  v_owner_folder text := coalesce(v_owner::text, 'guest');
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

  if (storage.foldername(p_image_path))[1] is distinct from v_owner_folder then
    raise exception 'image_path does not belong to the caller';
  end if;

  if not exists (
    select 1 from storage.objects
    where bucket_id = 'paintings' and name = p_image_path
  ) then
    raise exception 'image_path does not reference an uploaded object';
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
