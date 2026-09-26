-- Display names are unique, ignoring case and surrounding spaces, so "Thew"
-- and "thew " can't both exist.
create unique index profiles_display_name_unique
  on public.profiles (lower(trim(display_name)))
  where trim(display_name) <> '';

-- Sign-up checks the name first, but two people could still race for the
-- same one, and older sign-ups fell back to the email prefix. Rather than
-- failing the whole sign-up on a clash, the trigger adds a short suffix; the
-- person can change it on their profile afterwards.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_base text := left(trim(coalesce(
    nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
    split_part(new.email, '@', 1)
  )), 55);
  v_name text := v_base;
begin
  while exists (
    select 1 from public.profiles where lower(trim(display_name)) = lower(v_name)
  ) loop
    v_name := v_base || '-' || substr(md5(random()::text), 1, 4);
  end loop;

  insert into public.profiles (id, display_name) values (new.id, v_name);
  return new;
end;
$$;

-- Lets the sign-up form and guest uploads check a name without exposing
-- anything beyond yes/no.
create or replace function public.display_name_taken(p_name text, p_exclude uuid default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where lower(trim(display_name)) = lower(trim(p_name))
      and (p_exclude is null or id <> p_exclude)
  );
$$;

grant execute on function public.display_name_taken(text, uuid) to anon, authenticated, service_role;
