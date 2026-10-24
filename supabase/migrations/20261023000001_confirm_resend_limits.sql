-- "Send a new link" for an expired or missing confirmation email. Each one
-- comes out of the same email budget as sign-ups and password resets (Resend,
-- 100 a day) and lands in someone's inbox, so it gets its own limit.
-- claim_auth_attempt already gives a kind it doesn't name 5 per hour per IP
-- and 5 per hour per email, so only the table has to allow the new kind.
alter table public.auth_attempt_log drop constraint auth_attempt_log_kind_check;
alter table public.auth_attempt_log add constraint auth_attempt_log_kind_check
  check (kind in ('sign_in', 'sign_up', 'password_reset', 'confirm_resend'));
