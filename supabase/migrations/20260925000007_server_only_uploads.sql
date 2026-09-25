-- Make the Next.js server the only way to create a painting, then rate-limit
-- it there. Before this, anyone holding the (public-by-design) publishable key
-- could call storage and create_painting() directly and upload without limit.
--
-- Accounts are paused, so this is written for guest-only mode. When accounts
-- come back: re-grant execute on create_painting to `authenticated` (or have
-- the server pass the owner id), and recreate an owner-folder storage insert
-- policy if uploads go through the user's own session again.

-- 1. No direct RPC access for browser-side roles; only the service role
--    (used server-side) can create paintings.
revoke execute on function public.create_painting(uuid, text, text, text, text, text[], text)
  from anon, authenticated, public;
grant execute on function public.create_painting(uuid, text, text, text, text, text[], text)
  to service_role;

-- 2. No direct storage uploads for browser-side roles. The service role
--    bypasses RLS, so server uploads still work.
drop policy if exists "owners or guests can upload painting images" on storage.objects;

-- 3. Upload rate limiting. Stores a salted hash of the uploader's IP (never
--    the raw IP), readable/writable only via the service role.
create table public.upload_log (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index upload_log_ip_created_idx on public.upload_log (ip_hash, created_at desc);
create index upload_log_created_idx on public.upload_log (created_at desc);

alter table public.upload_log enable row level security;
-- (No policies: nothing but the service role can touch it.)

-- Atomically checks the per-IP and sitewide limits and records the attempt.
-- The advisory lock serializes concurrent callers so a burst of parallel
-- requests can't all squeeze past the count.
create or replace function public.claim_upload_slot(p_ip_hash text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  per_ip_hourly_limit constant int := 5;
  per_ip_daily_limit constant int := 20;
  sitewide_hourly_limit constant int := 60;
begin
  perform pg_advisory_xact_lock(hashtext('justpaint_upload_slot'));

  if (select count(*) from upload_log
      where ip_hash = p_ip_hash and created_at > now() - interval '1 hour') >= per_ip_hourly_limit
     or (select count(*) from upload_log
      where ip_hash = p_ip_hash and created_at > now() - interval '1 day') >= per_ip_daily_limit then
    raise exception 'rate_limited_ip';
  end if;

  if (select count(*) from upload_log
      where created_at > now() - interval '1 hour') >= sitewide_hourly_limit then
    raise exception 'rate_limited_site';
  end if;

  insert into upload_log (ip_hash) values (p_ip_hash);

  -- Keep the table small.
  delete from upload_log where created_at < now() - interval '2 days';
end;
$$;

revoke execute on function public.claim_upload_slot(text) from anon, authenticated, public;
grant execute on function public.claim_upload_slot(text) to service_role;
