-- Password reset emails come out of the same email budget as sign-up
-- confirmations (Resend, 100 a day), and each one lands in someone's inbox.
-- Limit them like sign-in: 3 per hour per IP, and 3 per hour per email (so
-- rotating IPs can't flood one person's inbox).
alter table public.auth_attempt_log drop constraint auth_attempt_log_kind_check;
alter table public.auth_attempt_log add constraint auth_attempt_log_kind_check
  check (kind in ('sign_in', 'sign_up', 'password_reset'));

-- Same as before, plus the password_reset limit.
create or replace function public.claim_auth_attempt(p_kind text, p_ip_hash text, p_email_hash text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit int := case p_kind when 'sign_in' then 10 when 'password_reset' then 3 else 5 end;
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
