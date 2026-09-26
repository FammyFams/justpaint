-- Security audit fixes (2026-09-26). Signed-in users are now treated like
-- guests: every write goes through the Next.js server's service-role client,
-- which checks who you are, validates input, and rate-limits. Browser roles
-- (anon, authenticated) can read public data but write nothing directly.
--
-- Before this, the original policies from _init.sql let any signed-in user
-- POST/PATCH straight to PostgREST: posts with no upload limit, someone
-- else's image under their name, fake heart counts, future dates that pin a
-- post to the top, swapping an image file after posting, comment spam, and
-- editing any profile column.

-- ------------------------------------------------------------------
-- 1. No direct writes from browser roles
-- ------------------------------------------------------------------

drop policy if exists "owners can insert their own paintings" on public.paintings;
drop policy if exists "owners can update their own paintings" on public.paintings;
drop policy if exists "owners can delete their own paintings" on public.paintings;
drop policy if exists "owners can tag their own paintings" on public.paintings_tags;
drop policy if exists "owners can untag their own paintings" on public.paintings_tags;
drop policy if exists "users can like as themselves" on public.likes;
drop policy if exists "users can unlike as themselves" on public.likes;
drop policy if exists "users can comment as themselves" on public.comments;
drop policy if exists "authors or painting owners can delete comments" on public.comments;
drop policy if exists "users can update their own profile" on public.profiles;

revoke insert, update, delete on
  public.paintings, public.paintings_tags, public.tags,
  public.likes, public.comments, public.profiles
from anon, authenticated;

-- Storage: no swapping or deleting files from the browser (the server
-- deletes a post's file when the post is deleted), and no listing the
-- bucket. It's a public bucket, so image URLs keep working without a
-- select policy.
drop policy if exists "owners can update their painting images" on storage.objects;
drop policy if exists "owners can delete their painting images" on storage.objects;
drop policy if exists "anyone can view painting images" on storage.objects;

-- ------------------------------------------------------------------
-- 2. Limits the database enforces itself
-- ------------------------------------------------------------------

-- Display and guest names: letters, numbers, spaces, dots, dashes and
-- underscores. Blocks look-alike letters from other alphabets and invisible
-- characters, which could otherwise impersonate an existing name.
alter table public.profiles
  add constraint profiles_display_name_format
    check (display_name ~ '^[A-Za-z0-9._-]([A-Za-z0-9._ -]{0,28}[A-Za-z0-9._-])$'),
  add constraint profiles_bio_length check (char_length(bio) <= 280);

alter table public.paintings
  add constraint paintings_title_length check (char_length(trim(title)) between 1 and 80),
  add constraint paintings_description_length check (char_length(description) <= 600),
  add constraint paintings_guest_name_format
    check (guest_name is null or guest_name ~ '^[A-Za-z0-9._-]([A-Za-z0-9._ -]{0,28}[A-Za-z0-9._-])?$');

alter table public.comments
  add constraint comments_body_length check (char_length(trim(body)) between 1 and 500);

alter table public.tags
  add constraint tags_name_length check (char_length(name) <= 30);

-- ------------------------------------------------------------------
-- 3. New accounts: clean the name from sign-up metadata
-- ------------------------------------------------------------------

-- Sign-up can be called directly against Supabase Auth, skipping the app's
-- form checks, so the trigger cleans the requested name to the allowed
-- format and makes it unique.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_base text;
  v_name text;
begin
  v_base := coalesce(
    nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
    split_part(new.email, '@', 1)
  );
  v_base := regexp_replace(v_base, '[^A-Za-z0-9._ -]', '', 'g');
  v_base := trim(both ' ' from regexp_replace(v_base, '\s+', ' ', 'g'));
  v_base := trim(both ' ' from left(v_base, 25));
  if char_length(v_base) < 2 then
    v_base := 'painter';
  end if;

  v_name := v_base;
  while exists (
    select 1 from public.profiles where lower(trim(display_name)) = lower(v_name)
  ) loop
    v_name := v_base || '-' || substr(md5(random()::text), 1, 4);
  end loop;

  insert into public.profiles (id, display_name) values (new.id, v_name);
  return new;
end;
$$;

-- ------------------------------------------------------------------
-- 4. create_painting: only tags from the existing list, at most 5
-- ------------------------------------------------------------------

create or replace function public.create_painting(
  p_id uuid,
  p_title text,
  p_description text,
  p_image_path text,
  p_aspect text,
  p_tag_names text[] default '{}',
  p_guest_name text default null,
  p_owner_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid := p_owner_id;
  v_owner_folder text := coalesce(v_owner::text, 'guest');
  v_tag_ids uuid[];
begin
  if v_owner is null and (p_guest_name is null or length(trim(p_guest_name)) = 0) then
    raise exception 'guest_name is required when posting without an account';
  end if;

  if v_owner is not null and not exists (select 1 from public.profiles where id = v_owner) then
    raise exception 'owner has no profile';
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

  select array_agg(id) into v_tag_ids
  from public.tags
  where name = any (coalesce(p_tag_names, '{}'));

  if v_tag_ids is null or cardinality(v_tag_ids) = 0 then
    raise exception 'pick at least one tag from the list';
  end if;
  if cardinality(v_tag_ids) > 5 then
    raise exception 'at most 5 tags';
  end if;

  insert into public.paintings (id, owner_id, guest_name, title, description, image_path, aspect)
  values (
    p_id,
    v_owner,
    case when v_owner is null then trim(p_guest_name) else null end,
    trim(p_title),
    coalesce(trim(p_description), ''),
    p_image_path,
    p_aspect
  );

  insert into public.paintings_tags (painting_id, tag_id)
  select p_id, unnest(v_tag_ids)
  on conflict do nothing;

  return p_id;
end;
$$;

revoke execute on function public.create_painting(uuid, text, text, text, text, text[], text, uuid)
  from anon, authenticated, public;
grant execute on function public.create_painting(uuid, text, text, text, text, text[], text, uuid)
  to service_role;

-- ------------------------------------------------------------------
-- 5. Comments: posted through the server, rate-limited per account
-- ------------------------------------------------------------------

create or replace function public.add_comment(p_user_id uuid, p_painting_id uuid, p_body text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  -- One lock per user, so parallel requests can't slip past the count.
  perform pg_advisory_xact_lock(hashtext('justpaint_comment:' || p_user_id::text));

  if (select count(*) from public.comments
      where user_id = p_user_id and created_at > now() - interval '10 minutes') >= 5 then
    raise exception 'rate_limited_comment';
  end if;

  if (select count(*) from public.comments
      where user_id = p_user_id and created_at > now() - interval '1 day') >= 50 then
    raise exception 'rate_limited_comment';
  end if;

  insert into public.comments (painting_id, user_id, body)
  values (p_painting_id, p_user_id, trim(p_body))
  returning id into v_id;

  return v_id;
end;
$$;

revoke execute on function public.add_comment(uuid, uuid, text) from anon, authenticated, public;
grant execute on function public.add_comment(uuid, uuid, text) to service_role;

-- ------------------------------------------------------------------
-- 6. Admin login: at most 5 attempts per IP per 15 minutes
-- ------------------------------------------------------------------

create table public.admin_login_log (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index admin_login_log_ip_time on public.admin_login_log (ip_hash, created_at);
alter table public.admin_login_log enable row level security;
-- No policies: only the service role (which bypasses RLS) touches it.

create or replace function public.claim_admin_login_attempt(p_ip_hash text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform pg_advisory_xact_lock(hashtext('justpaint_admin_login'));

  if (select count(*) from public.admin_login_log
      where ip_hash = p_ip_hash and created_at > now() - interval '15 minutes') >= 5 then
    raise exception 'rate_limited_admin';
  end if;

  insert into public.admin_login_log (ip_hash) values (p_ip_hash);
  delete from public.admin_login_log where created_at < now() - interval '1 day';
end;
$$;

revoke execute on function public.claim_admin_login_attempt(text) from anon, authenticated, public;
grant execute on function public.claim_admin_login_attempt(text) to service_role;
