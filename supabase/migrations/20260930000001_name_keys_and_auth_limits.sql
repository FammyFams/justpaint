-- ------------------------------------------------------------------
-- 1. Names are unique by their profile address
-- ------------------------------------------------------------------
-- Profile addresses turn spaces into dashes ("Ash W" -> /artist/Ash-W), so
-- "Ash W" and "Ash-W" used to be two different names sharing one address,
-- and the newer account could take over the older one's page. Compare names
-- the way the address does: ignore case, spaces count as dashes.
create or replace function public.name_key(p_name text)
returns text
language sql
immutable
set search_path = ''
as $$
  select lower(regexp_replace(trim(p_name), ' +', '-', 'g'));
$$;

drop index if exists public.profiles_display_name_unique;
create unique index profiles_display_name_unique
  on public.profiles (public.name_key(display_name))
  where trim(display_name) <> '';

create or replace function public.display_name_taken(p_name text, p_exclude uuid default null)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where public.name_key(display_name) = public.name_key(p_name)
      and (p_exclude is null or id <> p_exclude)
  );
$$;

revoke execute on function public.display_name_taken(text, uuid) from anon, authenticated, public;
grant execute on function public.display_name_taken(text, uuid) to service_role;

-- Same cleanup as before, but a name must contain a letter or number (".."
-- has no reachable profile page) and the clash check uses the address form.
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
  if char_length(v_base) < 2 or v_base !~ '[A-Za-z0-9]' then
    v_base := 'painter';
  end if;

  v_name := v_base;
  while exists (
    select 1 from public.profiles where public.name_key(display_name) = public.name_key(v_name)
  ) loop
    v_name := v_base || '-' || substr(md5(random()::text), 1, 4);
  end loop;

  insert into public.profiles (id, display_name) values (new.id, v_name);
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from anon, authenticated, public;

-- ------------------------------------------------------------------
-- 2. Sign-in and sign-up limits
-- ------------------------------------------------------------------
-- Supabase's own auth limits see the Vercel server's IP, not the visitor's,
-- so one script could lock everyone out or keep guessing a password. Count
-- attempts here instead, per hashed IP and per hashed email.
create table public.auth_attempt_log (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('sign_in', 'sign_up')),
  key_hash text not null,
  created_at timestamptz not null default now()
);
create index auth_attempt_log_key_time on public.auth_attempt_log (kind, key_hash, created_at);
alter table public.auth_attempt_log enable row level security;
revoke all on public.auth_attempt_log from anon, authenticated;
-- No policies: only the service role (which bypasses RLS) touches it.

-- Sign-in: 10 tries per 15 minutes per IP, and 10 per 15 minutes per email
-- (so rotating IPs doesn't help against one account).
-- Sign-up: 5 per hour per IP.
create or replace function public.claim_auth_attempt(p_kind text, p_ip_hash text, p_email_hash text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit int := case p_kind when 'sign_in' then 10 else 5 end;
  v_window interval := case p_kind when 'sign_in' then interval '15 minutes' else interval '1 hour' end;
begin
  perform pg_advisory_xact_lock(hashtext('justpaint_auth_attempt'));

  if (select count(*) from public.auth_attempt_log
      where kind = p_kind and key_hash = p_ip_hash and created_at > now() - v_window) >= v_limit
     or (p_email_hash is not null and (select count(*) from public.auth_attempt_log
      where kind = p_kind and key_hash = p_email_hash and created_at > now() - v_window) >= v_limit) then
    raise exception 'rate_limited_auth';
  end if;

  insert into public.auth_attempt_log (kind, key_hash) values (p_kind, p_ip_hash);
  if p_email_hash is not null then
    insert into public.auth_attempt_log (kind, key_hash) values (p_kind, p_email_hash);
  end if;
  delete from public.auth_attempt_log where created_at < now() - interval '1 day';
end;
$$;

revoke execute on function public.claim_auth_attempt(text, text, text) from anon, authenticated, public;
grant execute on function public.claim_auth_attempt(text, text, text) to service_role;
