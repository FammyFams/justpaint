-- Per-IP limit is now 5 uploads per rolling 16 hours (was 3 per 24 hours).
-- Sitewide cap of 60/hour stays as a backstop.
create or replace function public.claim_upload_slot(p_ip_hash text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  per_ip_limit constant int := 5;
  per_ip_window constant interval := interval '16 hours';
  sitewide_hourly_limit constant int := 60;
begin
  perform pg_advisory_xact_lock(hashtext('justpaint_upload_slot'));

  if (select count(*) from upload_log
      where ip_hash = p_ip_hash and created_at > now() - per_ip_window) >= per_ip_limit then
    raise exception 'rate_limited_ip';
  end if;

  if (select count(*) from upload_log
      where created_at > now() - interval '1 hour') >= sitewide_hourly_limit then
    raise exception 'rate_limited_site';
  end if;

  insert into upload_log (ip_hash) values (p_ip_hash);

  delete from upload_log where created_at < now() - interval '2 days';
end;
$$;

revoke execute on function public.claim_upload_slot(text) from anon, authenticated, public;
grant execute on function public.claim_upload_slot(text) to service_role;
